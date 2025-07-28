import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { google, calendar_v3 } from 'googleapis';
import IUsersRepository from '../repositories/IUsersRepository';
import getWeekRange from '@shared/utils/date/getWeekRange';

@injectable()
export default class GetGoogleCalendarEventsService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  public async authenticate(email: string): Promise<calendar_v3.Schema$Event[]> {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CLIENT_URI,
    );

    const user = await this.usersRepository.findByEmail(email);
    if (!user || !user.tokens) {
      throw new AppError('User not found or not authenticated', 400);
    }

    oAuth2Client.setCredentials({ access_token: user.tokens });

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const { startOfWeek, endOfWeek } = getWeekRange();
    endOfWeek.setDate(startOfWeek.getDate() + 180); // Pode ser ajustado

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfWeek.toISOString(),
      timeMax: endOfWeek.toISOString(),
      maxResults: 10000,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items ?? [];

    // Filtra apenas os que têm dateTime
    const validEvents = events.filter(event => event.start?.dateTime && event.end?.dateTime);

    return validEvents.map(event => ({
      start: { dateTime: event.start!.dateTime! },
      end: { dateTime: event.end!.dateTime! },
    }));
  }
}
