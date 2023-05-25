import { google } from 'googleapis';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class CreateEventService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(phone:string): Promise<string| null| undefined> {
    // const oauth2Client = new google.auth.OAuth2();

    const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, 'http://localhost:3030');

    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    oAuth2Client.setCredentials({ access_token: user.tokens });

    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,

    });

    const event = {
      summary: 'tesssttteee',
      description: '',
      location: '',
      attendees: [{ email: 'luizmariano203@gmail.com' }],
      start: {
        dateTime: '2023-05-24T05:00:00-03:00',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: '2023-05-24T22:00:00-03:00',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const back = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,

    });
    console.log(`Event created: ${back.data.htmlLink}`);

    return back.data.htmlLink;
  }
}
