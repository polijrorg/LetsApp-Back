/* eslint-disable no-console */
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { calendar_v3, google } from 'googleapis';

import IUsersRepository from '../repositories/IUsersRepository';
import getWeekRange from '@shared/utils/date/getWeekRange';

@injectable()
export default class GetGoogleCalendarEvents {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(email:string): Promise<any> {
    // const oauth2Client = new google.auth.OAuth2();

    const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CLIENT_URI);

    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new AppError('User not found', 400);
    // console.log(`GetGoogleCalendarEventsService 18: user: ${JSON.stringify(user)}`);
    oAuth2Client.setCredentials({ access_token: user?.tokens });
    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    const { startOfWeek, endOfWeek } = getWeekRange();

    endOfWeek.setDate(startOfWeek.getDate() + 180);
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfWeek.toISOString(),
      timeMax: endOfWeek.toISOString(),
      maxResults: 10000,
      singleEvents: true,
      orderBy: 'startTime',

    });
    const events = response.data.items;

    // console.log(`GetGoogleCalendarEventsService 35: events: ${JSON.stringify(events)}`);
    if (!events) throw new AppError('Events not found', 400);

    return { events, user };
  }
}
