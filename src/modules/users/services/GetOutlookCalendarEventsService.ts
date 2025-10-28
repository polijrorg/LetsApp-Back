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
    
    // Get events from 30 days ago to 180 days in the future
    const now = new Date();
    now.setDate(now.getDate() - 30); // Start from 30 days ago to include recent past events
    
    const end = new Date();
    end.setDate(end.getDate() + 180); // 180 days in the future

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

    // First, try to get ALL events to see if there are any at all
    console.log(`🔍 Attempting to fetch ALL calendar events (no filter)`);
    
    let getEvents;
    try {
      // Try fetching without date filter first
      getEvents = await graphClient
        .api(`/me/calendar/events`)
        .select('subject,start,end,location,bodyPreview,attendees,organizer,onlineMeeting,isAllDay,id')
        .orderby('start/dateTime')
        .top(250)
        .header('Prefer', 'outlook.timezone="America/Sao_Paulo"')
        .get();
        
      console.log(`📊 Total events in calendar: ${getEvents?.value?.length || 0}`);
      
      if (getEvents?.value?.length > 0) {
        console.log(`📝 First event: ${JSON.stringify(getEvents.value[0])}}`);
        console.log(`📝 Last event: ${JSON.stringify(getEvents.value[getEvents.value.length - 1])}`);
        
        // Now filter in JavaScript for the date range
        const filteredEvents = getEvents.value.filter((event: any) => {
          const eventEnd = new Date(event.end.dateTime);
          const eventStart = new Date(event.start.dateTime);
          return eventEnd >= now && eventStart <= end;
        });
        
        console.log(`📊 Events in date range (${now.toISOString()} to ${end.toISOString()}): ${filteredEvents.length}`);
        getEvents.value = filteredEvents;
      } else {
        console.log(`⚠️ No events found in calendar at all!`);
      }
    } catch (error: any) {
      console.error(`❌ Error fetching Outlook events:`, error?.message || error);
      throw error;
    }
    
    return getEvents;
  }
}
