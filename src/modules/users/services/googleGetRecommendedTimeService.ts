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
  ): Promise<{ horariosGoogle: any[], missingGoogleAuthentications: string[] }> {
    const urlservice = container.resolve(GetCalendarEventsService);

    const horariosGoogle:calendar_v3.Schema$Event[] = [];

    const missingGoogleAuthentications: string[] = [];

    // Considering this version an MVP, we decided to broke the call for any unlogged user;
    // For future versions is viable to implement the try-catch block inside the map loop
    const promises = googleUsers.map(async (user) => {
      try {
        const aux = await urlservice.getTimes(user);
        for (let index = 0; index < aux.length; index += 1) {
          horariosGoogle.push(aux[index]);
        }
      } catch (error) {
        missingGoogleAuthentications.push(user);
      }
    });
    await Promise.all(promises);

    return { horariosGoogle, missingGoogleAuthentications };
  }
}
