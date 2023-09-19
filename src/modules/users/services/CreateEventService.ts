import { google } from 'googleapis';
import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import CreateInviteService from '@modules/invites/services/CreateInviteService';
import { Invite } from '@prisma/client';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
    phone:string;
    begin:string; end:string;
    attendees:string[];
    description:string;
    address:string;
    createMeetLink:boolean;
    name:string;
    optionalAtendees:string[];

}
@injectable()
export default class CreateEventService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    address, attendees, begin, createMeetLink, description, end, phone, name, optionalAtendees,
  }:IRequest): Promise<Invite> {
    // const oauth2Client = new google.auth.OAuth2();
    const eventAttendees = attendees.map((email) => ({
      email,
      // You can initialize other properties of EventAttendee here if needed
    }));

    const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.CLIENT_URI);

    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    oAuth2Client.setCredentials({ access_token: user.token });

    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,

    });
    // const emails = attendees.map((email) => ({ email }));

    const event = {
      summary: name,
      description,
      location: address,
      attendees: eventAttendees,
      start: {
        dateTime: begin,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      conferenceData: {
        createRequest: {
          requestId: 'random_id',
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };
    let back;
    if (createMeetLink) {
      back = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,

      });
    } else {
      back = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        sendUpdates: 'all',

      });
    }

    const CreateInviteEvent = container.resolve(CreateInviteService);
    const state = 'accepted';
    const invite = await CreateInviteEvent.execute({
      name,
      begin,
      end,
      guests: attendees,
      optionalGuests: optionalAtendees,
      phone,
      description,
      address,
      link: back.data.hangoutLink,
      state,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      googleId: back.data.id!,
      organizerPhoto: user.photo,
      organizerName: user.name!,
    });

    return invite;
  }
}
