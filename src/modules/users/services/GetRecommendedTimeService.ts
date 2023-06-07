// import { calendar_v3, google } from 'googleapis';
// import { container, inject, injectable } from 'tsyringe';
// import AppError from '@shared/errors/AppError';
// import IUsersRepository from '../repositories/IUsersRepository';
// import GetCalendarEventsService from './GetCalendarEventsService';

// interface ISchedule {
//     start: Date;
//     end: Date;
//   }
// interface IRequest{
//   phone:string,
//       beginDate:string,
//       endDate:string,
//       beginHour:string,
//       endHour:string,
//       duration:string,
//       mandatoryGuests:string,
//       optionalGuests:string
// }
// @injectable()
// export default class GetCalendarEvents {
//   constructor(
//     @inject('UsersRepository')
//     private usersRepository: IUsersRepository,

//   ) { }

//   public async authenticate({
//     beginDate, beginHour, duration, endDate, endHour, mandatoryGuests, optionalGuests, phone,
//   }:IRequest): Promise<(calendar_v3.Schema$EventDateTime | undefined)[][]> {
//     // Define the type for the response

//     type EventsListResponse = calendar_v3.Schema$Events;

//     // Function to compare events and find free time intervals
//     function findFreeTimeIntervals(events: EventsListResponse[]): calendar_v3.Schema$TimePeriod[] {
//       // Sort the events by start time
//       const sortedEvents = events.sort(
//         (a, b) => new Date(a.start!.dateTime!).getTime() - new Date(b.start!.dateTime!).getTime(),
//       );

//       // Find the free time intervals between events
//       const freeTimeIntervals: calendar_v3.Schema$TimePeriod[] = [];
//       for (let i = 1; i < sortedEvents.length; i + 1) {
//         const previousEvent = sortedEvents[i - 1];
//         const currentEvent = sortedEvents[i];

//         const previousEndTime = new Date(previousEvent.end!.dateTime!).getTime();
//         const currentStartTime = new Date(currentEvent.start!.dateTime!).getTime();

//         if (previousEndTime < currentStartTime) {
//           // There is a free time interval between the events
//           const freeInterval: calendar_v3.Schema$TimePeriod = {
//             start: {
//               dateTime: new Date(previousEndTime).toISOString(),
//             },
//             end: {
//               dateTime: new Date(currentStartTime).toISOString(),
//             },
//           };

//           freeTimeIntervals.push(freeInterval);
//         }
//       }

//       return freeTimeIntervals;
//     }

//     // Example usage
//     const events: EventsListResponse[] = [eventsResponse1, eventsResponse2, eventsResponse3]; // Replace with your actual events data
//     const freeTimeIntervals = findFreeTimeIntervals(events);
//     console.log('Free Time Intervals:', freeTimeIntervals);

//     return simplerS;
//   }
// }
