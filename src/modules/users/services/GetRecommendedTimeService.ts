import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import moment, { Moment } from 'moment-timezone';
import IUsersRepository from '../repositories/IUsersRepository';
import googleGetRecommendedTimeService from './googleGetRecommendedTimeService';
import outlookGetRecommendedTimeService from './outlookGetRecommendedTimeService';
import UserManagementService from './UserManagementService';

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

interface IMissingAuthentications {
  google: string[];
  outlook: string[];
}

@injectable()
export default class GetRecommendedTimesService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    beginDate, beginHour, duration, endDate, endHour, mandatoryGuests, phone,
  }:IRequest): Promise<{ freeTimes: IFreeTime[], missingAuthentications: IMissingAuthentications }> {
    moment.tz.setDefault('America/Sao_Paulo');

    const user = await this.usersRepository.findByPhone(phone);

    if (!user) throw new AppError('User not found', 400);

    const currentTime = moment();

    const googleGetTime = container.resolve(googleGetRecommendedTimeService);
    const outlookGetTime = container.resolve(outlookGetRecommendedTimeService);
    const managementService = container.resolve(UserManagementService);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mandatoryGuests.push(user.email!);

    const outlookUsers: string[] = [];
    const googleUsers: string[] = [];

    const { guests } = await managementService.execute(mandatoryGuests, []);

    // fix
    // eslint-disable-next-line no-restricted-syntax
    for (const element of guests) {
      // eslint-disable-next-line no-await-in-loop
      const userType = await this.usersRepository.findTypeByEmail(element);

      if (userType === 'GOOGLE') {
        googleUsers.push(element);
      } else if (userType === 'OUTLOOK') {
        outlookUsers.push(element);
      }
    }

    const { horariosGoogle, missingGoogleAuthentications } = await googleGetTime.authenticate(googleUsers);
    const googleBusyTimes = horariosGoogle;

    const { horariosOutlook, missingOutlookAuthentications } = await outlookGetTime.authenticate(outlookUsers);
    const outlookBusyTimes = horariosOutlook;

    const missingAuthentications = {
      google: missingGoogleAuthentications,
      outlook: missingOutlookAuthentications,
    };

    const roundUp = (start: moment.Moment) => {
      if (start.minute() === 0 && start.second() === 0) return start;
      if ((start.minute() > 30) || (start.minute() === 30 && start.second() !== 0)) {
        const roundUpBegin = start.minute() || start.second() || start.millisecond() ? start.add(1, 'hour').startOf('hour') : start.startOf('hour');
        return roundUpBegin;
      } if (start.minute() < 30) {
        const roundUpBegin = start.minute() || start.second() || start.millisecond() ? start.add(1, 'minute').startOf('minute') : start.startOf('minute');
        while (roundUpBegin.minute() !== 30) {
          roundUpBegin.add(1, 'minute');
        }
        return roundUpBegin;
      }
      return start;
    };

    const roundDown = (end: moment.Moment) => {
      if ((end.minute() > 30) || (end.minute() === 30 && end.second() !== 0)) {
        const roundDownEnd = end.minute(30).second(0);
        return roundDownEnd;
      } if (end.minute() < 30) {
        const roundDownEnd = end.minute(0).second(0);
        return roundDownEnd;
      }
      return end;
    };

    const getFreeTimes = (start: moment.Moment, end: moment.Moment) => {
      const freeTimes: IFreeTime[] = [];
      const diff = end.diff(start) / 60000;

      const roundedStart = roundUp(start);
      const roundedEnd = roundDown(end);

      if (diff > 0 && roundedStart > moment(beginDate) && roundedEnd < moment(endDate).add(1, 'days') && duration <= diff) {
        let eventStart = moment(roundedStart);
        const eventEnd = moment(roundedStart);
        eventEnd.add(duration, 'minute');

        const earlyHourLimit = moment(roundedStart);
        earlyHourLimit.set('hour', parseInt(beginHour.slice(0, 2), 10));
        earlyHourLimit.set('minute', parseInt(beginHour.slice(3, 5), 10));
        earlyHourLimit.set('seconds', parseInt(beginHour.slice(6, 8), 10));

        const lateHourLimit = moment(roundedStart);
        lateHourLimit.set('hour', parseInt(endHour.slice(0, 2), 10));
        lateHourLimit.set('minute', parseInt(endHour.slice(3, 5), 10));
        lateHourLimit.set('seconds', parseInt(endHour.slice(6, 8), 10));

        while (eventEnd <= roundedEnd && eventStart >= earlyHourLimit && eventStart <= lateHourLimit && eventEnd <= lateHourLimit && eventEnd >= earlyHourLimit) {
          if (eventStart >= currentTime) {
            freeTimes.push({ start: eventStart.tz('America/Sao_Paulo').format(), end: eventEnd.tz('America/Sao_Paulo').format() });
          }
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

    const dataAllTimes = simplerS;

    // Custom comparison function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function compareDates(a:any, b:any) {
      const dateTimeA = moment(a[0]);
      const dateTimeB = moment(b[0]);

      return dateTimeA.diff(dateTimeB);
    }

    const beginSearch = moment(`${beginDate.slice(0, 11)}${beginHour}${beginDate.slice(19, 25)}`);
    const endSearch = moment(`${endDate.slice(0, 11)}${endHour}${endDate.slice(19, 25)}`);

    if (beginSearch.isBefore(currentTime) && endSearch.isBefore(currentTime)) return { freeTimes, missingAuthentications };

    if ((googleBusyTimes.length === 0 && outlookBusyTimes.length === 0)) {
      const start = moment(`${beginDate.slice(0, 11)}${beginHour}${beginDate.slice(19, 25)}`);
      const end = moment(`${endDate.slice(0, 11)}${endHour}${endDate.slice(19, 25)}`);

      const loopTimes = getFreeTimes(start, end);
      loopTimes.map((loopTime) => freeTimes.push(loopTime));
      return { freeTimes, missingAuthentications };
    }
    const intervalStart1 = moment(`${beginDate.slice(0, 11)}${beginHour}${beginDate.slice(19, 25)}`);

    const intervalStart = roundUp(intervalStart1);

    const intervalEnd1 = moment(`${endDate.slice(0, 11)}${endHour}${endDate.slice(19, 25)}`);

    const intervalEnd = roundDown(intervalEnd1);

    // Sort the array based on the first datetime of each index
    dataAllTimes.sort(compareDates);

    const data: moment.Moment[][] = [];

    // Delete times that are tottaly out of the interval
    // eslint-disable-next-line array-callback-return
    dataAllTimes.map((event) => {
      if ((event[0] <= intervalStart && event[1] > intervalStart) || (event[0] >= intervalStart && event[1] <= intervalEnd) || (event[0] < intervalEnd && event[1] >= intervalEnd)) {
        data.push(event);
      }
    });

    if (data.length === 0) {
      const start = moment(`${beginDate.slice(0, 11)}${beginHour}${beginDate.slice(19, 25)}`);
      const end = moment(`${endDate.slice(0, 11)}${endHour}${endDate.slice(19, 25)}`);

      const loopTimes = getFreeTimes(start, end);
      loopTimes.map((loopTime) => freeTimes.push(loopTime));
      return { freeTimes, missingAuthentications };
    }

    const isIntervalBeforeEventStart = intervalEnd.isBefore(data[0][0]);
    const isIntervalAfterEventEnd = intervalStart.isAfter(data[data.length - 1][1]);

    if (isIntervalBeforeEventStart || isIntervalAfterEventEnd) {
      const start = moment(`${beginDate.slice(0, 11)}${beginHour}${beginDate.slice(19, 25)}`);
      const end = moment(`${endDate.slice(0, 11)}${endHour}${endDate.slice(19, 25)}`);

      const loopTimes = getFreeTimes(start, end);
      loopTimes.map((loopTime) => freeTimes.push(loopTime));
      return { freeTimes, missingAuthentications };
    }

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
    return { freeTimes, missingAuthentications };
  }
}
