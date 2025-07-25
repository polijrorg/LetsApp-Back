/* eslint-disable @typescript-eslint/no-explicit-any */
import msal from '@azure/msal-node';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { Client } from '@microsoft/microsoft-graph-client';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class GetOutlookCalendarEvents {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(email:string): Promise<any> {
    const now = new Date();
    now.setHours(now.getHours() - (now.getTimezoneOffset() / 60));
    const end = new Date();
    end.setDate(now.getDate() - (now.getTimezoneOffset() / 60) + 180);

    const user = await this.usersRepository.findByEmail(email);
    console.log(`GetOutlookCalendarEvents 30: User: ${JSON.stringify(user)}`);
    if (!user) throw new AppError('User not found', 400);

    if (!user.tokens) throw new AppError('Token not found', 400);

    const tokenCache = JSON.parse(user.tokens);

    const clientConfig = {
      auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID as string,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
        authority: 'https://login.microsoftonline.com/common',
      },
      system: {
        loggerOptions: {
          loggerCallback(loglevel: any, message: any, containsPii: any) {
            console.log(message);
          },
          piiLoggingEnabled: false,
          logLevel: 3,
        }
      }
    };

    const cca = new msal.ConfidentialClientApplication(clientConfig);
    cca.getTokenCache().deserialize(tokenCache);

    const account = JSON.parse(cca.getTokenCache().serialize()).Account;

    const tokenRequest = {
      account,
      scopes: ['openid', 'offline_access', 'User.Read', 'Calendars.Read'],
    };

    const tokens = await cca.acquireTokenSilent(tokenRequest);
    if (!tokens) throw new AppError('Token not found', 400);
    // console.log(`GetOutlookCalendarEvents 45: tokens: ${JSON.stringify(tokens)}`);
    const authProvider = {
      getAccessToken: async () => tokens.accessToken as string,
    };

    const graphClient = Client.initWithMiddleware({ authProvider });

    const getEvents = await graphClient.api(`/users/${user.email}/calendar/events`).filter(`(start/dateTime ge '${now.toISOString()}' and end/dateTime le '${end.toISOString()}') or (start/dateTime le '${now.toISOString()}' and end/dateTime ge '${now.toISOString()}')`).header('Prefer', 'outlook.timezone="America/Sao_Paulo"').get();
    // console.log(`GetOutlookCalendarEvent/s 50: Events${JSON.stringify(getEvents)}`);
    return getEvents;
  }
}
