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
    console.log(`🔍 GetOutlookCalendarEvents: Starting authentication for ${email}`);
    
    // Get current time and 180 days in the future (no timezone adjustment needed - Graph API handles it)
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 180);

    console.log(`📅 Date range: ${now.toISOString()} to ${end.toISOString()}`);

    const user = await this.usersRepository.findByEmail(email);
    console.log(`GetOutlookCalendarEvents 30: User found: ${!!user}, Email: ${user?.email}`);
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
      scopes: ['openid','profile', 'offline_access', 'User.Read', 'Calendars.ReadWrite', 'OnlineMeetings.ReadWrite'],
    };

    const tokens = await cca.acquireTokenSilent(tokenRequest);
    if (!tokens) throw new AppError('Token not found', 400);
    // console.log(`GetOutlookCalendarEvents 45: tokens: ${JSON.stringify(tokens)}`);
    const authProvider = {
      getAccessToken: async () => tokens.accessToken as string,
    };

    const graphClient = Client.initWithMiddleware({ authProvider });

    // Simplified filter: get all events that end after now and start before the end date
    const filterQuery = `start/dateTime lt '${end.toISOString()}' and end/dateTime ge '${now.toISOString()}'`;
    console.log(`🔍 Filter query: ${filterQuery}`);
    
    const getEvents = await graphClient
      .api(`/users/${user.email}/calendar/events`)
      .filter(filterQuery)
      .header('Prefer', 'outlook.timezone="America/Sao_Paulo"')
      .top(250) // Limit to 250 events
      .get();
      
    console.log(`📊 GetOutlookCalendarEvents: Retrieved ${getEvents?.value?.length || 0} events from Microsoft Graph`);
    
    if (getEvents?.value?.length > 0) {
      console.log(`📝 First event sample: ${JSON.stringify(getEvents.value[0]).substring(0, 300)}...`);
    }
    
    return getEvents;
  }
}
