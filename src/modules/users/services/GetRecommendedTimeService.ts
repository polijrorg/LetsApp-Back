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
export default class GetRecommendedTimesService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    beginDate, beginHour, duration, endDate, endHour, mandatoryGuests, phone,
  }:IRequest): Promise<IFreeTime[]> {
    moment.tz.setDefault('America/Sao_Paulo');

    const user = await this.usersRepository.findByPhone(phone);

    if (!user) throw new AppError('User not found', 400);

    const googleGetTime = container.resolve(googleGetRecommendedTimeService);
    const outlookGetTime = container.resolve(outlookGetRecommendedTimeService);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mandatoryGuests.push(user.email!);

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

    const googleRecommendedTimes = await googleGetTime.authenticate(googleUsers);

    const outlookRecommendedTimes = await outlookGetTime.authenticate(outlookUsers);

    const getFreeTimes = (start: moment.Moment, end: moment.Moment) => {
      const freeTimes: IFreeTime[] = [];
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
          aux2.add(duration, 'minute');
          while (aux2 <= end) {
            freeTimes.push({ start1: aux1.tz('America/Sao_Paulo').format(), end1: aux2.tz('America/Sao_Paulo').format() });
            aux1 = moment(aux2);
            aux2.add(duration, 'minute');
          }
        }
      }
      return freeTimes;
    };

    if (googleRecommendedTimes.length === 0 && outlookRecommendedTimes.length === 0) {
      const start = moment(`${beginDate.slice(0, 11)}${beginHour}${beginDate.slice(19, 25)}`);
      const end = moment(`${endDate.slice(0, 11)}${endHour}${endDate.slice(19, 25)}`);
      const freeTimes = getFreeTimes(start, end);
      return freeTimes;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recommendedTimes: any[] = googleRecommendedTimes.concat(outlookRecommendedTimes);

    const freeTimes: IFreeTime[] = [];
    // eslint-disable-next-line no-sequences
    const simplerS = recommendedTimes.map((event) => ([moment(event.start?.dateTime), moment(event.end?.dateTime)]));

    console.log(simplerS);

    if (simplerS === undefined) throw new AppError('Uasdasda', 400);

    const data = simplerS;

    // Custom comparison function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function compareDates(a:any, b:any) {
      const dateTimeA = moment(a[0]);

      const dateTimeB = moment(b[0]);

      return dateTimeA.diff(dateTimeB);
    }

    // Sort the array based on the first datetime of each index
    data.sort(compareDates);

    let start: moment.Moment;
    let end: moment.Moment;

    // eslint-disable-next-line no-plusplus
    for (let index = 0; index <= data.length; index++) {
      try {
        if (index !== 0) {
          // console.log('if data !==0 ', data[index - 1][1]);
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

        const loopTimes = getFreeTimes(start, end);
        freeTimes.concat(loopTimes);

      // eslint-disable-next-line no-console
      } catch (e) { console.log('error', e); }
    }

    return freeTimes;
  }
}
