import { google } from 'googleapis';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  eventId:string,
  email:string,
  begin:string,
  end:string
}

@injectable()
export default class UpdateEventService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    begin, end, email, eventId,
  }:IRequest): Promise<void> {
    // const oauth2Client = new google.auth.OAuth2();
    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new AppError('User not found', 400);
    const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.GOOGLE_CLIENT_URI}`);

    const inviteFound = await this.usersRepository.findInvite(eventId);
    if (!inviteFound) throw new AppError('Invite not found', 400);

    oAuth2Client.setCredentials({ access_token: user.tokens });

    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,

    });

    const event = {

      start: {
        dateTime: begin,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },

    };

    await calendar.events.patch({
      eventId: inviteFound.googleId,
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all',
    });
  }
}
