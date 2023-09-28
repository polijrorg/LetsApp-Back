import msal from '@azure/msal-node';
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

  public async authenticate(
    beginDate:string, beginHour:string, duration:number, endDate:string, endHour:string, email:string,
  ): Promise<string> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) throw new AppError('User not found', 400);

    const tokenCache = JSON.parse(user.token!);

    const clientConfig = {
      auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID as string,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      },
    };

    const cca = new msal.ConfidentialClientApplication(clientConfig);
    cca.getTokenCache().deserialize(tokenCache);

    const account = JSON.parse(cca.getTokenCache().serialize()).Account;

    const tokenRequest = {
      account,
      scopes: ['https://graph.microsoft.com/.default'],
    };

    const tokens = await cca.acquireTokenSilent(tokenRequest);
    if (!tokens) throw new AppError('Token not found', 400);

    const authProvider = {
      getAccessToken: async () => tokens.accessToken as string,
    };

    const graphClient = Client.initWithMiddleware({ authProvider });

    const scheduleInformation = {
      schedules: [email],
      startTime: {
        dateTime: `${beginDate.slice(0, 11)}${beginHour}`,
        timeZone: 'America/Sao_Paulo',
      },
      endTime: {
        dateTime: `${endDate.slice(0, 11)}${endHour}`,
        timeZone: 'America/Sao_Paulo',
      },
      availabilityViewInterval: duration,
    };

    const checkTimes = await graphClient.api('/me/calendar/getSchedule').header('Prefer', 'outlook.timezone="America/Sao_Paulo"').post(scheduleInformation);
    return checkTimes.value[0].availabilityView;
  }
}
