import { calendar_v3, google } from 'googleapis';
import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { homegraph } from 'googleapis/build/src/apis/homegraph';
import moment from 'moment';
import IUsersRepository from '../repositories/IUsersRepository';
import GetCalendarEventsService from './GetCalendarEventsService';

interface ISchedule {
  dateTime?: string;
  timeZone?: string;
  date?: string;
}

interface IFreeTime {
  date?: Date|string |null;
  start?: Date|string|null;
  end?: Date|string|null;
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
    beginDate, beginHour, duration, endDate, endHour, mandatoryGuests, optionalGuests, phone,
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
    const simplerS = horarios.map((event) => ([event.start, event.end]));

    if (simplerS === undefined) throw new AppError('Uasdasda', 400);

    const freeTimes: IFreeTime[] = [];

    const data = simplerS;

    // Custom comparison function
    function compareDates(a, b) {
      const dateTimeA = new Date(a[0].dateTime);

      const dateTimeB = new Date(b[0].dateTime);

      return dateTimeA - dateTimeB;
    }

    // Sort the array based on the first datetime of each index

    data.sort(compareDates);

    try {
      // eslint-disable-next-line consistent-return

      data.forEach((scheduleSet, index) => {
        if (index + 1 > data.length) {
          return freeTimes;
        }
        if (data[index + 1] !== undefined || scheduleSet !== undefined) {
          if (scheduleSet[1] !== undefined || data[index + 1][0] !== undefined) {
            const start = scheduleSet[1]?.dateTime;

            const end = data[index + 1][0]?.dateTime;

            if (start < end && start > beginDate && end < endDate && ((Date.parse(end) - Date.parse(start)) / 60000) >= duration) {
              const startDate1 = start?.slice(0, 11) + beginHour + start?.slice(19, 25);

              const endDate1 = start?.slice(0, 11) + endHour + start?.slice(19, 25);

              if (start > startDate1 && end < endDate1) {
                console.log(startDate1, endDate1);

                let aux1 = moment(start);
                const aux2 = moment(start);

                while (aux2.format() < end) {
                  aux2.add(duration, 'minutes');

                  freeTimes.push({ start: aux1.format(), end: aux2.format() });

                  aux1 = moment(aux2);
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
