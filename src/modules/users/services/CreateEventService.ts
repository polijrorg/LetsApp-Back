import { google } from 'googleapis';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
    phone:string;
    begin:string; end:string;
    attendees:string[];
    description:string;
    address:string;
    createMeetLink:boolean;
    name:string;
}
@injectable()
export default class CreateEventService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    address, attendees, begin, createMeetLink, description, end, phone, name,
  }:IRequest): Promise<string| null| undefined> {
    // const oauth2Client = new google.auth.OAuth2();

    const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.CLIENT_URI);

    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    oAuth2Client.setCredentials({ access_token: user.tokens });

    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,

    });
    const emails = attendees.map((email) => ({ email }));

    const event = {
      summary: name,
      description,
      location: address,
      attendees: emails,
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
          requestId: 'random_id', // Provide a unique ID for each request
          conferenceSolutionKey: {
            type: 'hangoutsMeet', // Use 'hangoutsMeet' for Google Meet
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

      });
    }
    return back.data;
  }
}
