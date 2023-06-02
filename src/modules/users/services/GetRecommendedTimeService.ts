// import { calendar_v3, google } from 'googleapis';
// import { container, inject, injectable } from 'tsyringe';
// import AppError from '@shared/errors/AppError';
// import IUsersRepository from '../repositories/IUsersRepository';
// import GetCalendarEventsService from './GetCalendarEventsService';

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

//     // eslint-disable-next-line no-restricted-syntax
//     for (const set of simplerS) {
//       const start = new Date(set[0].dateTime);
//       const end = new Date(set[1].dateTime);
//       const difference = end.getTime() - start.getTime();
//       console.log(`Difference: ${difference} milliseconds`);
//     }
//     // const tempo = simplerS.forEach((item, index) => {
//     //   const date1 = new Date(simplerS[index + 1][0].);
//     //   return ( - simplerS?[index + 1][0]?.dateTime?)
//     // });

//     console.log(tempo);

//     return simplerS;
//   }
// }
