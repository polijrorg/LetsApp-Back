import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

import GetOutlookCalendarEventsService from './GetOutlookCalendarEventsService';

  @injectable()
export default class GetCalendarEvents {
  constructor(
      @inject('UsersRepository')
      private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(
    outlookUsers: string[], phone: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[]> {
    const user = await this.usersRepository.findByPhone(phone);

    if (!user) throw new AppError('User not found', 400);

    const urlservice = container.resolve(GetOutlookCalendarEventsService);

    const usersPhone: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const horarios: any[] = [];
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < outlookUsers.length; index++) {
      if (outlookUsers[index].includes('@')) {
        // eslint-disable-next-line no-await-in-loop
        const userPhone = await this.usersRepository.findPhoneByEmail(outlookUsers[index]);
        usersPhone.push(userPhone);
      } else {
        usersPhone.push(outlookUsers[index]);
      }
    }

    for (let i = 0; i < usersPhone.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const aux = await urlservice.authenticate(usersPhone[i]);

      for (let index = 0; index < aux.value.length; index += 1) {
        horarios.push(aux.value[index]);
      }
    }
    return horarios;
  }
}
