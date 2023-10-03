import msal from '@azure/msal-node';
import { Event } from '@microsoft/microsoft-graph-types';
import { Client } from '@microsoft/microsoft-graph-client';
import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import CreateInviteService from '@modules/invites/services/CreateInviteService';
import UserManagementService from '@modules/users/services/UserManagementService';
import { Invite } from '@prisma/client';

import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  phone:string;
  begin:string; end:string;
  attendees: string[];
  description:string;
  address:string;
  createMeetLink:boolean;
  name:string;
  optionalAttendees:string[];
}

interface IMeeting {
  url:string;
  conferenceId:string;
}

@injectable()
export default class CreateOutlookCalendarEventService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    phone, begin, end, attendees, description, address, name, optionalAttendees, createMeetLink,
  }: IRequest): Promise<Invite> {
    // To create the invite we need a valid full-registered-users guest list.
    // In order to achieve this, we call a service that separates the guests into four lists:
    const userManagementService = container.resolve(UserManagementService);

    // Guests management
    const {
      guests, pseudoGuests, optionalGuests, pseudoOptionalGuests,
    } = await userManagementService.execute(attendees, optionalAttendees);

    const attendeesEmail = guests;
    attendeesEmail.concat(optionalGuests);

    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    const tokenCache = JSON.parse(user.tokens!);

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

    // Graph client configuration

    const authProvider = {
      getAccessToken: async () => tokens.accessToken as string,
    };

    const graphClient = Client.initWithMiddleware({ authProvider });

    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < attendeesEmail.length; index++) {
      const element = attendeesEmail[index];
      if (!element.includes('@')) {
        try {
          // eslint-disable-next-line no-await-in-loop
          attendeesEmail[index] = await this.usersRepository.findEmailByPhone(element);
        } catch (error) {
          console.log(error.message);
        }
      }
    }

    const event: Event = {
      subject: name,
      bodyPreview: description,
      location: {
        address:
        { street: address },
      },
      start: {
        dateTime: begin,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: attendeesEmail.map((email) => ({
        emailAddress: {
          address: email,
        },
        type: 'required',
      })),
    };

    // Creates an event on the user's calendar and invites the attendees
    await graphClient.api('me/events').post(event);

    // Tries to create a meeting link for the event
    const getMeetLink = async (): Promise<IMeeting | null> => {
      if (createMeetLink) {
        console.log('creating meeting link');
        try { // will only work with business or school accounts
          const meeting = await graphClient.api('/me/onlineMeetings').post({
            startDateTime: begin,
            endDateTime: end,
            subject: name,
            joinMeetingIdSettings: {
              isPasscodeRequired: false,
            },
          });
          return {
            url: meeting.joinWebUrl,
            conferenceId: meeting.id,
          };
        } catch (error) {
          console.log(error.body);
          return null;
        }
      }
      return null;
    };

    const meeting = await getMeetLink();

    // Creates the invite on the database
    const CreateInviteEvent = container.resolve(CreateInviteService);
    const state = 'accepted';
    const invite = await CreateInviteEvent.execute({
      name,
      begin,
      end,
      guests,
      optionalGuests,
      pseudoGuests,
      pseudoOptionalGuests,
      phone,
      description,
      address,
      link: meeting?.url || null,
      state,
      googleId: meeting?.conferenceId || 'none',
      organizerPhoto: user.photo,
      organizerName: user.name || 'organizer',
    });

    return invite;
  }
}
