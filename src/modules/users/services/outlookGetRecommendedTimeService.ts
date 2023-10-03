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
  ): Promise<any[]> {
    const urlservice = container.resolve(GetOutlookCalendarEventsService);

    const usersEmail: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const horarios: any[] = [];
    // eslint-disable-next-line no-plusplus
    const promises = outlookUsers.map(async (outlookUser) => {
      if (outlookUser.includes('@')) {
        usersEmail.push(outlookUser);
      } else {
        const email = await this.usersRepository.findEmailByPhone(outlookUser);
        usersEmail.push(email);
      }
    });

    await Promise.all(promises);

    for (let i = 0; i < usersEmail.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const aux = await urlservice.authenticate(usersEmail[i]);

      for (let index = 0; index < aux.value.length; index += 1) {
        horarios.push(aux.value[index]);
      }
    }
    return horarios;
  }
}
