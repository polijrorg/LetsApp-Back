import { calendar_v3 } from 'googleapis';
import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import moment from 'moment-timezone';
import IUsersRepository from '../repositories/IUsersRepository';
import GetCalendarEventsService from './GetCalendarEventsService';

@injectable()
export default class GetCalendarEvents {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(
    googleUsers: string[], phone: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[]> {
    const user = await this.usersRepository.findByPhone(phone);

    if (!user) throw new AppError('User not found', 400);

    const urlservice = container.resolve(GetCalendarEventsService);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const schedule = await urlservice.authenticate(user.email!);
    moment.tz.setDefault('America/Sao_Paulo');
    const horarios:calendar_v3.Schema$Event[] = [];
    schedule.forEach((element) => {
      horarios.push(element);
    });

    for (let i = 0; i < googleUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const aux = await urlservice.authenticate(googleUsers[i]);

      for (let index = 0; index < aux.length; index += 1) {
        horarios.push(aux[index]);
      }
    }
    return horarios;
  }
}
