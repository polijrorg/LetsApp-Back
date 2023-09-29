import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import moment, { Moment } from 'moment-timezone';
import IUsersRepository from '../repositories/IUsersRepository';
import googleGetRecommendedTimeService from './googleGetRecommendedTimeService';
import outlookGetRecommendedTimeService from './outlookGetRecommendedTimeService';

interface IFreeTime {
  date?: Moment|string |null;
  start1?: Moment|string|null;
  end1?: Moment|string|null;
}
interface IRequest{
  phone:string,
      beginDate:string,
      endDate:string,
      beginHour:string,
      endHour:string,
      duration:number,
      mandatoryGuests:string[],
      optionalGuests:string
}
@injectable()
export default class GetCalendarEvents {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    beginDate, beginHour, duration, endDate, endHour, mandatoryGuests, phone, optionalGuests,
  }:IRequest): Promise<IFreeTime[]> {
    moment.tz.setDefault('America/Sao_Paulo');

    const user = await this.usersRepository.findByPhone(phone);

    if (!user) throw new AppError('User not found', 400);

    const googleGetTime = container.resolve(googleGetRecommendedTimeService);
    const outlookGetTime = container.resolve(outlookGetRecommendedTimeService);

    // mandatoryGuests.push(user.email!);

    const outlookUsers: string[] = [];
    const googleUsers: string[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const element of mandatoryGuests) {
      // eslint-disable-next-line no-await-in-loop
      const userType = await this.usersRepository.findTypeByEmail(element);

      if (userType === 'GOOGLE') {
        googleUsers.push(element);
      } else if (userType === 'OUTLOOK') {
        outlookUsers.push(element);
      }
    }

    // const googleRecommendedTimes = await googleGetTime.authenticate(
    //   googleUsers, phone,
    // );

    const outlookRecommendedTimes = await outlookGetTime.authenticate(
      outlookUsers, phone,
    );

    // const recommendedTimes: any[] = googleRecommendedTimes.concat(outlookRecommendedTimes);

    // eslint-disable-next-line no-sequences
    const simplerS = outlookRecommendedTimes.map((event) => ([moment(event.start?.dateTime), moment(event.end?.dateTime)]));

    if (simplerS === undefined) throw new AppError('Uasdasda', 400);

    const freeTimes: IFreeTime[] = [];

    const data = simplerS;

    // Custom comparison function
    function compareDates(a:any, b:any) {
      const dateTimeA = moment(a[0]);

      const dateTimeB = moment(b[0]);

      return dateTimeA.diff(dateTimeB);
    }

    // Sort the array based on the first datetime of each index
    let start: moment.Moment;
    let end: moment.Moment;

    data.sort(compareDates);
    console.log();

    // eslint-disable-next-line no-plusplus
    for (let index = 0; index <= data.length; index++) {
      try {
        if (index <= data.length) {
          if (index !== 0) {
            start = moment(data[index - 1][1]);
          } else {
            start = moment(`${beginDate.slice(0, 11)}${beginHour}${beginDate.slice(19, 25)}`);
          }
          if (index === 0) {
            end = moment(data[index][0]);
          } else if (index > (data.length - 1)) {
            end = moment(`${endDate.slice(0, 11)}${endHour}${endDate.slice(19, 25)}`);
          } else {
            end = moment(data[index][0]);
          }

          const diff = end.diff(start) / 60000;

          if (diff > 0 && start > moment(beginDate) && end < moment(endDate).add(1, 'days') && duration <= diff) {
            const startDate1 = moment(start);
            startDate1.set('hour', parseInt(beginHour.slice(0, 2), 10));
            startDate1.set('minute', parseInt(beginHour.slice(3, 5), 10));
            startDate1.set('seconds', parseInt(beginHour.slice(6, 8), 10));

            const endDate1 = moment(start);
            endDate1.set('hour', parseInt(endHour.slice(0, 2), 10));
            endDate1.set('minute', parseInt(endHour.slice(3, 5), 10));
            endDate1.set('seconds', parseInt(endHour.slice(6, 8), 10));

            if (start >= startDate1 && end <= endDate1) {
              let aux1 = moment(start);
              const aux2 = moment(start);

              while (aux2 < end) {
                aux2.add(duration, 'minute');
                freeTimes.push({ start1: aux1.tz('America/Sao_Paulo').format(), end1: aux2.tz('America/Sao_Paulo').format() });
                aux1 = moment(aux2);
              }
            }
          }
        }
      } catch (e) { console.log('error', e); }
    }

    return freeTimes;
  }
}
