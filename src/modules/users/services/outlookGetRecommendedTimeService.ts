import { container, inject, injectable } from 'tsyringe';
import IUsersRepository from '../repositories/IUsersRepository';

import GetOutlookCalendarEventsService from './GetOutlookCalendarEventsService';

  @injectable()
export default class GetCalendarEvents {
  constructor(
      @inject('UsersRepository')
      private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(
    outlookUsers: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ horariosOutlook: any[], missingOutlookAuthentications: string[] }> {
    const urlservice = container.resolve(GetOutlookCalendarEventsService);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const horariosOutlook: any[] = [];

    const missingOutlookAuthentications: string[] = [];

    const promises = outlookUsers.map(async (outlookUser) => {
      try {
        const aux = await urlservice.authenticate(outlookUser);
        for (let index = 0; index < aux.value.length; index += 1) {
          horariosOutlook.push(aux.value[index]);
        }
      } catch (error) {
        missingOutlookAuthentications.push(outlookUser);
      }
    });

    await Promise.all(promises);

    return { horariosOutlook, missingOutlookAuthentications };
  }
}
