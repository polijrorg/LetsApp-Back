import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';
import outlookGetScheduleService from './outlookGetScheduleService';

// interface IFreeTime {
//   date?: Moment|string |null;
//   start1?: Moment|string|null;
//   end1?: Moment|string|null;
// }
interface IRequest{
    phone:string,
    beginDate:string,
    beginHour:string,
    endDate:string,
    endHour:string,
    duration:number,
    mandatoryGuests:string[],
  }
  @injectable()
export default class GetCalendarEvents {
  constructor(
      @inject('UsersRepository')
      private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    beginDate, beginHour, duration, endDate, endHour, mandatoryGuests, phone,
  }:IRequest): Promise<number[]> {
    const user = await this.usersRepository.findByPhone(phone);

    if (!user) throw new AppError('User not found', 400);

    const availabilityView = container.resolve(outlookGetScheduleService);

    const schedule: string [] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const element of mandatoryGuests) {
      // eslint-disable-next-line no-await-in-loop
      const aux = await availabilityView.authenticate(
        beginDate, beginHour, duration, endDate, endHour, element,
      );
      schedule.push(aux);
    }
    function findIndexesWithZero(arr: string[]): number[] {
      if (arr.length < 3) {
        return [];
      }

      const indexes: number[] = [];

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < arr[0].length; i++) {
        const isZeroInAll = arr.every((str) => str[i] === '0');

        if (isZeroInAll) {
          indexes.push(i);
        }
      }

      return indexes;
    }

    const index = findIndexesWithZero(schedule);
    const recommendedTimes: number[] = [];
    index.forEach((element) => {
      const result = ((duration * (element)) / 60);
      const hour = parseInt(beginHour.split(':')[0], 10);
      recommendedTimes.push(result + hour);
    });
    return recommendedTimes;
  }
}
// const meetingTimeSuggestionResult = {
//   attendees: outlookUsers.map((email) => ({
//     emailAddress: {
//       address: email,
//     },
//     type: 'required',
//   })),
//   timeConstraint: {
//     activityDomain: 'work',
//     timeSlots: [
//       {
//         start: {
//           dateTime: `${beginDate.slice(0, 11)}${beginHour}`,
//           timeZone: 'America/Sao_Paulo',
//         },
//         end: {
//           dateTime: `${endDate.slice(0, 11)}${endHour}`,
//           timeZone: 'America/Sao_Paulo',
//         },
//       },
//     ],
//   },
//   isOrganizerOptional: 'false',
//   meetingDuration: 'PT1H',
//   returnSuggestionReasons: 'true',
//   minimumAttendeePercentage: 100,
// };
// const suggestedTime = await graphClient.api('me/findMeetingTimes').header('Prefer', 'outlook.timezone="America/Sao_Paulo"').post(meetingTimeSuggestionResult);
// return suggestedTime;
