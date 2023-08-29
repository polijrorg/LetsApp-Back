import { Response } from 'express';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { Client } from '@microsoft/microsoft-graph-client';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class GetCalendarEvents {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(phone:string): Promise<Response> {
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 180);

    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    const authProvider = {
      getAccessToken: async () => user.tokens as string,
    };

    const graphClient = Client.initWithMiddleware({ authProvider });
    const events = await graphClient.api('/me/calendar/events').filter(`start/dateTime ge '${now.toISOString()}' and end/dateTime le '${end.toISOString()}'`).get();

    return events;
  }
}
