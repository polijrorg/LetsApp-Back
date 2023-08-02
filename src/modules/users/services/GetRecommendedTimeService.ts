import { calendar_v3 } from 'googleapis';
import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import moment, { Moment } from 'moment';
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

    const schedule = await urlservice.authenticate(phone);
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

    // Custom comparison function
    function compareDates(a:any, b:any) {
      const dateTimeA = a[0];

      const dateTimeB = b[0];

      return dateTimeA - dateTimeB;
    }

    // Sort the array based on the first datetime of each index

    data.sort(compareDates);
    try {
      // eslint-disable-next-line consistent-return

      // eslint-disable-next-line consistent-return
      data.forEach((scheduleSet, index) => {
        if (index + 1 > data.length) {
          return freeTimes;
        }
        if (data[index + 1] !== undefined || scheduleSet !== undefined) {
          if (scheduleSet[1] !== undefined || data[index + 1][0] !== undefined) {
            const start = moment(scheduleSet[1]);

            const end = moment(data[index + 1][0]);

            const diff = (Date.parse(end.toString()) - Date.parse(start.toString())) / 60000;

            if (start < end && start > moment(beginDate) && end < moment(endDate).add(1, 'days') && duration <= diff) {
              const startDate1 = moment(start);
              startDate1.set('hour', parseInt(beginHour.slice(0, 2), 10));
              startDate1.set('minute', parseInt(beginHour.slice(3, 5), 10));
              startDate1.set('seconds', parseInt(beginHour.slice(6, 8), 10));

              const endDate1 = moment(start);
              endDate1.set('hour', parseInt(endHour.slice(0, 2), 10));
              endDate1.set('minute', parseInt(endHour.slice(3, 5), 10));
              endDate1.set('seconds', parseInt(endHour.slice(6, 8), 10));

              if (start > startDate1 && end < endDate1) {
                let aux1 = start.clone();
                const aux2 = start.clone();

                while (aux2 < end) {
                  aux2.add(duration, 'minute');

                  freeTimes.push({ start1: aux1.format(), end1: aux2.format() });

                  aux1 = aux2.clone();
                }
              }
            }
          }
        }
      });
    } catch (e) { console.log(e); }

    return freeTimes;
  }
}
