import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import moment, { Moment } from 'moment-timezone';

interface IBusyTime {
  start: { dateTime: string };
  end: { dateTime: string };
}

interface IFreeTime {
  start: string;
  end: string;
}

interface IGenerateFreeTimesInput {
  busyIntervals: [Moment, Moment][];
  duration: number;
  beginMoment: Moment;
  endMoment: Moment;
  beginHour: string;
  endHour: string;
}

export async function classifyUsers(
  guests: string[],
  usersRepository: IUsersRepository
): Promise<{ googleUsers: string[]; outlookUsers: string[] }> {
  const googleUsers: string[] = [];
  const outlookUsers: string[] = [];

  for (const email of guests) {
    const type = await usersRepository.findTypeByEmail(email);
    if (type === 'GOOGLE') googleUsers.push(email);
    else if (type === 'OUTLOOK') outlookUsers.push(email);
  }

  return { googleUsers, outlookUsers };
}

export function mergeBusyTimes(
  google: IBusyTime[],
  outlook: IBusyTime[]
): IBusyTime[] {
  const all = [...google, ...outlook];
  return all.sort((a, b) => moment(a.start.dateTime).diff(moment(b.start.dateTime)));
}

export function buildBusyIntervals(busyTimes: IBusyTime[]): [Moment, Moment][] {
  const merged: [Moment, Moment][] = [];

  for (const event of busyTimes) {
    const start = moment(event.start.dateTime);
    const end = moment(event.end.dateTime);

    if (!merged.length) {
      merged.push([start, end]);
    } else {
      const last = merged[merged.length - 1];
      if (start.isSameOrBefore(last[1])) {
        last[1] = moment.max(last[1], end);
      } else {
        merged.push([start, end]);
      }
    }
  }

  return merged;
}

export function validateTimeWindow(
  beginDate: string,
  beginHour: string,
  endDate: string,
  endHour: string
): { isValid: boolean; beginMoment: Moment; endMoment: Moment } {
  const begin = moment(`${beginDate.slice(0, 11)}${beginHour}${beginDate.slice(19)}`);
  const end = moment(`${endDate.slice(0, 11)}${endHour}${endDate.slice(19)}`);
  const now = moment();

  return {
    isValid: end.isAfter(now),
    beginMoment: begin,
    endMoment: end,
  };
}

export function generateFreeTimes({
  busyIntervals,
  duration,
  beginMoment,
  endMoment,
  beginHour,
  endHour,
}: IGenerateFreeTimesInput): IFreeTime[] {
  const freeTimes: IFreeTime[] = [];
  let pointer = moment(beginMoment);

  const earlyLimit = moment(beginMoment).set({
    hour: parseInt(beginHour.slice(0, 2), 10),
    minute: parseInt(beginHour.slice(3, 5), 10),
    second: 0,
  });

  const lateLimit = moment(endMoment).set({
    hour: parseInt(endHour.slice(0, 2), 10),
    minute: parseInt(endHour.slice(3, 5), 10),
    second: 0,
  });

  for (const [start, end] of busyIntervals) {
    while (pointer.add(0, 'minute').isBefore(start)) {
      const slotEnd = moment(pointer).add(duration, 'minute');
      if (slotEnd.isAfter(start)) break;
      if (
        pointer.isSameOrAfter(earlyLimit) &&
        slotEnd.isSameOrBefore(lateLimit) &&
        slotEnd.isSameOrBefore(endMoment)
      ) {
        freeTimes.push({
          start: pointer.clone().format(),
          end: slotEnd.clone().format(),
        });
      }
      pointer = pointer.add(duration, 'minute');
    }
    pointer = moment.max(pointer, end);
  }

  // Check for remaining slot at the end
  while (pointer.add(0, 'minute').add(duration, 'minute').isSameOrBefore(endMoment)) {
    const slotEnd = pointer.clone().add(duration, 'minute');
    if (
      pointer.isSameOrAfter(earlyLimit) &&
      slotEnd.isSameOrBefore(lateLimit)
    ) {
      freeTimes.push({
        start: pointer.clone().format(),
        end: slotEnd.clone().format(),
      });
    }
    pointer = pointer.add(duration, 'minute');
  }

  return freeTimes;
}
