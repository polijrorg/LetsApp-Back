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
//     // const oauth2Client = new google.auth.OAuth2();

//     const user = await this.usersRepository.findByPhone(phone);
//     if (!user) throw new AppError('User not found', 400);
//     const urlservice = container.resolve(GetCalendarEventsService);

//     const schedule = await urlservice.authenticate(phone);

//     // eslint-disable-next-line no-sequences
//     const simplerS = schedule.map((event) => ([event.start, event.end]));

//     // // eslint-disable-next-line no-restricted-syntax
//     // for (const set of simplerS) {
//     //   const start = new Date(set[0].dateTime);
//     //   const end = new Date(set[1].dateTime);
//     //   const difference = end.getTime() - start.getTime();
//     //   console.log(`Difference: ${difference} milliseconds`);
//     // }
//     // // const tempo = simplerS.forEach((item, index) => {
//     // //   const date1 = new Date(simplerS[index + 1][0].);
//     // //   return ( - simplerS?[index + 1][0]?.dateTime?)
//     // // });

//     const schedules: ISchedule[][] = [
//       [
//         {
//           start: new Date('2023-06-05T23:00:00-03:00'),
//           end: new Date('2023-06-05T23:30:00-03:00'),
//         },
//         {
//           start: new Date('2023-06-06T05:00:00-03:00'),
//           end: new Date('2023-06-06T05:45:00-03:00'),
//         },
//       ],
//       [
//         {
//           start: new Date('2023-06-06T08:00:00-03:00'),
//           end: new Date('2023-06-06T09:30:00-03:00'),
//         },
//         {
//           start: new Date('2023-06-06T10:00:00-03:00'),
//           end: new Date('2023-06-06T11:00:00-03:00'),
//         },
//       ],
//       // Add more schedules here...
//     ];

//     const secondSchedule: ISchedule[] = [
//       {
//         start: new Date('2023-06-05T23:00:00-03:00'),
//         end: new Date('2023-06-05T23:30:00-03:00'),
//       },
//       {
//         start: new Date('2023-06-06T03:00:00-03:00'),
//         end: new Date('2023-06-06T05:45:00-03:00'),
//       },
//     ];

//     const freeTimes: ISchedule[] = [];

//     schedules.forEach((scheduleSet) => {
//       scheduleSet.forEach((schedule) => {
//         const endCurrent = scheduleSet[scheduleSet.length - 1].end;
//         const startNext = secondSchedule[0].start;

//         const timeDiff = startNext.getTime() - endCurrent.getTime();

//         if (timeDiff > 0) {
//           const minutesDiff = Math.floor(timeDiff / (1000 * 60)); // Convert milliseconds to minutes
//           const hours = Math.floor(minutesDiff / 60);
//           const minutes = minutesDiff % 60;

//           const freeTimeStart = new Date(endCurrent.getTime() + 1000); // Add 1 second to avoid overlapping with the current schedule
//           const freeTimeEnd = new Date(startNext.getTime() - 1000); // Subtract 1 second to avoid overlapping with the next schedule

//           freeTimes.push({ start: freeTimeStart, end: freeTimeEnd });
//         }
//       });
//     });

//     console.log('Free times between the schedules:');
//     freeTimes.forEach((freeTime) => {
//       console.log(`Start: ${freeTime.start.toISOString()}, End: ${freeTime.end.toISOString()}`);
//     });

//     return simplerS;
//   }
// }
