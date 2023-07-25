import { calendar_v3, google } from 'googleapis';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class GetCalendarEvents {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(phone:string): Promise<calendar_v3.Schema$Event[]> {
    // const oauth2Client = new google.auth.OAuth2();

    const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.CLIENT_URI);

    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    oAuth2Client.setCredentials({ access_token: user?.tokens });
    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 180);
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: end.toISOString(),
      maxResults: 10000,
      singleEvents: true,
      orderBy: 'startTime',

    });

    const events = response.data.items;
    if (!events) throw new AppError('Events not found', 400);

    return events;
  }
}
