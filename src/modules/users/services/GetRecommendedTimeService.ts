import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import moment, { Moment } from 'moment-timezone';
import IUsersRepository from '../repositories/IUsersRepository';
import googleGetRecommendedTimeService from './googleGetRecommendedTimeService';
import outlookGetRecommendedTimeService from './outlookGetRecommendedTimeService';

interface IFreeTime {
  date?: Moment|string |null;
  start?: Moment|string|null;
  end?: Moment|string|null;
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

    const googleBusyTimes = await googleGetTime.authenticate(googleUsers);

    const outlookBusyTimes = await outlookGetTime.authenticate(outlookUsers);

    const getFreeTimes = (start: moment.Moment, end: moment.Moment) => {
      const freeTimes: IFreeTime[] = [];
      const diff = end.diff(start) / 60000;

      if (diff > 0 && start > moment(beginDate) && end < moment(endDate).add(1, 'days') && duration <= diff) {
        let eventStart = moment(start);
        const eventEnd = moment(start);
        eventEnd.add(duration, 'minute');

        const earlyHourLimit = moment(start); // 23-10-07T15:00:00.000Z
        earlyHourLimit.set('hour', parseInt(beginHour.slice(0, 2), 10));
        earlyHourLimit.set('minute', parseInt(beginHour.slice(3, 5), 10));
        earlyHourLimit.set('seconds', parseInt(beginHour.slice(6, 8), 10));
        // 23-10-07T15:00:00.000Z

        const lateHourLimit = moment(start); // 23-10-07T17:00:00.000Z
        lateHourLimit.set('hour', parseInt(endHour.slice(0, 2), 10));
        lateHourLimit.set('minute', parseInt(endHour.slice(3, 5), 10));
        lateHourLimit.set('seconds', parseInt(endHour.slice(6, 8), 10));
        // 23-10-07T22:00:00.000Z

        console.log('start', start, 'earlyHourLimit', earlyHourLimit, 'end', end, 'lateHourLimit', lateHourLimit);

        while (eventEnd <= end && eventStart >= earlyHourLimit && eventStart <= lateHourLimit && eventEnd <= lateHourLimit && eventEnd >= earlyHourLimit) {
          // console.log('eventStart', eventStart, 'eventEnd', eventEnd);
          // console.log('earlyHourLimit', earlyHourLimit, 'lateHourLimit', lateHourLimit);
          freeTimes.push({ start: eventStart.tz('America/Sao_Paulo').format(), end: eventEnd.tz('America/Sao_Paulo').format() });
          eventStart = moment(eventEnd);
          eventEnd.add(duration, 'minute');
        }
      }
      return freeTimes;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const busyTimes: any[] = googleBusyTimes.concat(outlookBusyTimes);

    const freeTimes: IFreeTime[] = [];
    // eslint-disable-next-line no-sequences
    const simplerS = busyTimes.map((event) => ([moment(event.start?.dateTime), moment(event.end?.dateTime)]));

    // if (simplerS === undefined) throw new AppError('Uasdasda', 400);

    const data = simplerS;

    const intervalStart = moment(`${beginDate.slice(0, 11)}${beginHour}${beginDate.slice(19, 25)}`);
    const intervalEnd = moment(`${endDate.slice(0, 11)}${endHour}${endDate.slice(19, 25)}`);
    const isIntervalBeforeEventStart = intervalEnd.isBefore(data[0][0]);
    const isIntervalAfterEventEnd = intervalStart.isAfter(data[data.length - 1][1]);

    if ((googleBusyTimes.length === 0 && outlookBusyTimes.length === 0) || isIntervalBeforeEventStart || isIntervalAfterEventEnd) {
      const start = moment(`${beginDate.slice(0, 11)}${beginHour}${beginDate.slice(19, 25)}`);
      const end = moment(`${endDate.slice(0, 11)}${endHour}${endDate.slice(19, 25)}`);

      const loopTimes = getFreeTimes(start, end);
      loopTimes.map((loopTime) => freeTimes.push(loopTime));
      return freeTimes;
    }

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

        if (start.date() < end.date()) {
          if (end.date() - start.date() !== 1) {
            const loopTimes = getFreeTimes(start, moment(`${beginDate.slice(0, 11)}${endHour}${beginDate.slice(19, 25)}`).date(start.date()));
            loopTimes.map((loopTime) => freeTimes.push(loopTime));
            while (start.date() < end.date() - 1) {
              start.add(1, 'days');
              const loopTimes2 = getFreeTimes(moment(`${endDate.slice(0, 11)}${beginHour}${endDate.slice(19, 25)}`).date(start.date()), moment(`${beginDate.slice(0, 11)}${endHour}${beginDate.slice(19, 25)}`).date(start.date()));
              loopTimes2.map((loopTime) => freeTimes.push(loopTime));
            }
            const loopTimes3 = getFreeTimes(moment(`${endDate.slice(0, 11)}${beginHour}${endDate.slice(19, 25)}`).date(end.date()), end);
            loopTimes3.map((loopTime) => freeTimes.push(loopTime));
          } else {
            const loopTimes = getFreeTimes(start, moment(`${beginDate.slice(0, 11)}${endHour}${beginDate.slice(19, 25)}`).date(start.date()));
            loopTimes.map((loopTime) => freeTimes.push(loopTime));
            const loopTimes2 = getFreeTimes(moment(`${endDate.slice(0, 11)}${beginHour}${endDate.slice(19, 25)}`).date(end.date()), end);
            loopTimes2.map((loopTime) => freeTimes.push(loopTime));
          }
        } else {
          const loopTimes = getFreeTimes(start, end);
          loopTimes.map((loopTime) => freeTimes.push(loopTime));
        }

        // eslint-disable-next-line no-console
      } catch (e) { console.log('error', e); }
    }

    return freeTimes;
  }
}
