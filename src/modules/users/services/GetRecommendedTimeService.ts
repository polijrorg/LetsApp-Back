import { calendar_v3 } from 'googleapis';
import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import moment, { Moment } from 'moment-timezone';
import { UsingJoinColumnOnlyOnOneSideAllowedError } from 'typeorm';
import IUsersRepository from '../repositories/IUsersRepository';
import GetCalendarEventsService from './GetCalendarEventsService';

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
    beginDate, beginHour, duration, endDate, endHour, mandatoryGuests, phone,
  }:IRequest): Promise<IFreeTime[]> {
    const user = await this.usersRepository.findByPhone(phone);

    if (!user) throw new AppError('User not found', 400);

    const urlservice = container.resolve(GetCalendarEventsService);

    const schedule = await urlservice.authenticate(user.email!);
    moment.tz.setDefault('America/Sao_Paulo');
    const horarios:calendar_v3.Schema$Event[] = [];
    schedule.forEach((element) => {
      horarios.push(element);
    });

    for (let i = 0; i < mandatoryGuests.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const aux = await urlservice.authenticate(mandatoryGuests[i]);

      for (let index = 0; index < aux.length; index += 1) {
        horarios.push(aux[index]);
      }
    }
    // eslint-disable-next-line no-sequences
    const simplerS = horarios.map((event) => ([moment(event.start?.dateTime), moment(event.end?.dateTime)]));

    if (simplerS === undefined) throw new AppError('Uasdasda', 400);

    const freeTimes: IFreeTime[] = [];

    const data = simplerS;

    console.log(data);

    // // Custom comparison function
    // function compareDates(a:any, b:any) {
    //   const dateTimeA = moment(a[0]);

    //   const dateTimeB = moment(b[0]);

    //   return dateTimeA.diff(dateTimeB);
    // }

    // // Sort the array based on the first datetime of each index

    // data.sort(compareDates);

    data.forEach((scheduleSet, index) => {
      try {
        if ((index + 1) < (data.length - 1) && (data[index + 1] !== undefined || scheduleSet !== undefined)) {
          if (scheduleSet[1] !== undefined && data[index + 1][0] !== undefined) {
            const start = moment(scheduleSet[1]);

            const end = moment(data[index + 1][0]);

            const diff = end.diff(start) / 60000;

            if (diff > 0 && start > moment(beginDate) && end < moment(endDate).add(1, 'days') && duration <= diff) {
              const startDate1 = moment(start);
              startDate1.set('hour', parseInt(beginHour.slice(0, 2), 10));
              startDate1.set('minute', parseInt(beginHour.slice(3, 5), 10));
              startDate1.set('seconds', parseInt(beginHour.slice(6, 8), 10));
              console.log(startDate1);
              const endDate1 = moment(start);
              endDate1.set('hour', parseInt(endHour.slice(0, 2), 10));
              endDate1.set('minute', parseInt(endHour.slice(3, 5), 10));
              endDate1.set('seconds', parseInt(endHour.slice(6, 8), 10));
              console.log(endDate1);

              if (start > startDate1 && end < endDate1) {
                let aux1 = moment(start);
                const aux2 = moment(start);
                console.log(aux2 < end);
                while (aux2 < end) {
                  aux2.add(duration, 'minute');

                  freeTimes.push({ start1: aux1.tz('America/Sao_Paulo').format(), end1: aux2.tz('America/Sao_Paulo').format() });
                  aux1 = moment(aux2);
                }
              }
            }
          }
        }
      } catch (e) { console.log('error', e); }
    });

    return freeTimes;
  }
}
