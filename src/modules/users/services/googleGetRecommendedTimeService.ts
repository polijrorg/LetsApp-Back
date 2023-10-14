import { calendar_v3 } from 'googleapis';
import { container, inject, injectable } from 'tsyringe';
import IUsersRepository from '../repositories/IUsersRepository';
import GetCalendarEventsService from './GetGoogleCalendarEventsService';

@injectable()
export default class GetCalendarEvents {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(
    googleUsers: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[]> {
    const urlservice = container.resolve(GetCalendarEventsService);

    const horarios:calendar_v3.Schema$Event[] = [];

    const promises = googleUsers.map(async (user) => {
      const aux = await urlservice.authenticate(user);
      for (let index = 0; index < aux.length; index += 1) {
        horarios.push(aux[index]);
      }
    });

    await Promise.all(promises);

    // for (let i = 0; i < googleUsers.length; i += 1) {
    //   // eslint-disable-next-line no-await-in-loop
    //   const aux = await urlservice.authenticate(googleUsers[i]);

    //   for (let index = 0; index < aux.length; index += 1) {
    //     horarios.push(aux[index]);
    //   }
    // }
    // console.log(horarios);

    return horarios;
  }
}
