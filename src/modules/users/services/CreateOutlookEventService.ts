/* eslint-disable no-console */
import { Client } from '@microsoft/microsoft-graph-client';
import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import CreateInviteService from '@modules/invites/services/CreateInviteService';
import UserManagementService from '@modules/users/services/UserManagementService';
import { Invite } from '@prisma/client';
import IUsersRepository from '../repositories/IUsersRepository';
import {
  buildMsalClient,
  getGraphClient,
  resolveEmails,
  buildEvent,
  tryCreateMeetingLink,
} from '@shared/utils/outlookHelpers/outlookHelpers';
import msal from '@azure/msal-node';

interface IRequest {
  phone: string;
  begin: string;
  end: string;
  beginSearch: string;
  endSearch: string;
  attendees: string[];
  description: string;
  address: string;
  createMeetLink: boolean;
  name: string;
  optionalAttendees: string[];
}

@injectable()
export default class CreateOutlookCalendarEventService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  public async authenticate({
    phone,
    begin,
    end,
    beginSearch,
    endSearch,
    attendees,
    description,
    address,
    name,
    optionalAttendees,
    createMeetLink,
  }: IRequest): Promise<Invite> {
    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found in CreateOutlookEventService', 400);
    // console.log(`CreateOutlookEventService 45: User found: ${JSON.stringify(user.tokens)}`);
    const userManagementService = container.resolve(UserManagementService);
    const optionalAttendeesRefined = optionalAttendees.filter((item): item is NonNullable<typeof item> => item != null);
    const attendeesRefined = attendees.filter((item): item is NonNullable<typeof item> => item != null);

    console.log(`CreateOutlookEventService 45: ${JSON.stringify(attendees)}, ${JSON.stringify(optionalAttendees)}`);
    const {
      guests,
      pseudoGuests,
      optionalGuests,
      pseudoOptionalGuests,
    } = await userManagementService.execute(attendeesRefined, optionalAttendeesRefined);

    const allEmails = [...guests, ...optionalGuests];
    const resolvedEmails = await resolveEmails(allEmails, this.usersRepository.findEmailByPhone.bind(this.usersRepository));
    const tokenCache = JSON.parse(user?.tokens!);

    const clientConfig = {
        auth: {
          clientId: process.env.OUTLOOK_CLIENT_ID!,
          clientSecret: process.env.OUTLOOK_CLIENT_SECRET!,
          authority: 'https://login.microsoftonline.com/common',
        },
        system: {
          loggerOptions: {
            loggerCallback: (_level: any, message: any) => console.log(message),
            piiLoggingEnabled: false,
            logLevel: 3,
          },
        },
      };
    
    const cca = new msal.ConfidentialClientApplication(clientConfig);
    cca.getTokenCache().deserialize(tokenCache);
    
    // const cca = buildMsalClient(user.tokens!);
    // const graphClient: Client = await getGraphClient(cca);
    const account = JSON.parse(cca.getTokenCache().serialize()).Account;

      const tokenRequest = {
        account,
          scopes: ['openid','profile', 'offline_access', 'User.Read', 'Calendars.ReadWrite', 'OnlineMeetings.ReadWrite'],
      };
    
      const tokens = await cca.acquireTokenSilent(tokenRequest);
      if (!tokens) throw new Error('❌ AccessToken não encontrado com acquireTokenSilent.');
    
     const client = Client.initWithMiddleware({
        authProvider: {
          getAccessToken: async () => tokens.accessToken as string,
        },
      });

    const event = buildEvent({
      name,
      description,
      address,
      begin,
      end,
      attendees: resolvedEmails,
    });

    await client
      .api('me/events')
      .header('Prefer', 'outlook.timezone="America/Sao_Paulo"')
      .post(event);

    const meeting = createMeetLink
      ? await tryCreateMeetingLink(client, { name, begin, end })
      : null;

    const CreateInviteEvent = container.resolve(CreateInviteService);

    const invite = await CreateInviteEvent.execute({
      name,
      begin,
      end,
      beginSearch,
      endSearch,
      guests,
      optionalGuests,
      pseudoGuests,
      pseudoOptionalGuests,
      phone,
      description,
      address,
      link: meeting?.url || null,
      state: 'accepted',
      googleId: meeting?.conferenceId || 'none',
      organizerPhoto: user.photo,
      organizerName: user.name || 'organizer',
    });

    return invite;
  }
}
