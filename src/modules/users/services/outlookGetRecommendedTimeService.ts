import msal from '@azure/msal-node';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { Client } from '@microsoft/microsoft-graph-client';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest{
    phone:string,
    begin:string,
    end:string,
    duration:number,
    mandatoryGuests:string[],
    optionalGuests:string
  }
  @injectable()
export default class GetCalendarEvents {
  constructor(
      @inject('UsersRepository')
      private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    begin, duration, end, mandatoryGuests, phone,
  }:IRequest): Promise<Response> {
    const user = await this.usersRepository.findByPhone(phone);

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

    const meetingTimeSuggestionResult = {
      attendees: mandatoryGuests.map((email) => ({
        emailAddress: {
          address: email,
        },
        type: 'required',
      })),
      timeConstraint: {
        activityDomain: 'work',
        timeSlots: [
          {
            start: {
              dateTime: begin,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: end,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          },
        ],
      },
      isOrganizerOptional: 'false',
      meetingDuration: 'PT1H',
      returnSuggestionReasons: 'true',
      minimumAttendeePercentage: 100,
    };
    const suggestedTime = await graphClient.api('me/findMeetingTimes').header('Prefer', 'outlook.timezone="America/Sao_Paulo"').post(meetingTimeSuggestionResult);
    return suggestedTime;
  }
}
