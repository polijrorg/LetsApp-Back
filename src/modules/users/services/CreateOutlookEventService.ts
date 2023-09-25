import msal from '@azure/msal-node';
import { Event } from '@microsoft/microsoft-graph-types';
import { Client } from '@microsoft/microsoft-graph-client';
import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import CreateInviteService from '@modules/invites/services/CreateInviteService';
import { Invite } from '@prisma/client';
// import axios from 'axios';

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
    // eslint-disable-next-line no-var
    var attendeesEmail = attendees;
    // const oauth2Client = new google.auth.OAuth2();
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

    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < attendeesEmail.length; index++) {
      const element = attendeesEmail[index];
      if (!element.includes('@')) {
        // eslint-disable-next-line no-await-in-loop
        attendeesEmail[index] = await this.usersRepository.findEmailByPhone(element);
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
    await graphClient.api('me/events').post(event);

    const getMeetLink = async (): Promise<IMeeting | null> => {
      if (createMeetLink) {
        // try { // will only work with business or school accounts
        //   const meeting = await graphClient.api('/me/onlineMeetings').post({
        //     startDateTime: begin,
        //     endDateTime: end,
        //     subject: name,
        //     joinMeetingIdSettings: {
        //       isPasscodeRequired: false,
        //     },
        //   });
        //   return {
        //     url: meeting.joinWebUrl,
        //     conferenceId: meeting.videoTeleconferenceId,
        //   };
        // } catch {
        //   return null;
        // }

        // without microsoft graph
        // try {
        //   const graphEndpoint = 'https://graph.microsoft.com/v1.0/me/onlineMeetings';
        //   const { accessToken } = tokens;

        //   const meetingRequest = {
        //     startDateTime: begin,
        //     endDateTime: end,
        //   };

        //   const response = await axios.post(graphEndpoint, meetingRequest, {
        //     headers: {
        //       Authorization: `Bearer ${accessToken}`,
        //       'Content-Type': 'application/json',
        //     },
        //   });

        //   const meetingData = response.data;
        //   return meetingData;
        // } catch (error) {
        //   console.log('error');
        //   return null;
        // }
      }
      return null;
    };

    const meeting = await getMeetLink();

    const CreateInviteEvent = container.resolve(CreateInviteService);
    const state = 'accepted';
    const invite = await CreateInviteEvent.execute({
      name,
      begin,
      end,
      guests: attendees,
      optionalGuests: optionalAttendees,
      phone,
      description,
      address,
      link: meeting?.url,
      state,
      googleId: meeting?.conferenceId || 'none',
      organizerPhoto: user.photo,
      organizerName: user.name || 'organizer',
    });

    return invite;
  }
}
