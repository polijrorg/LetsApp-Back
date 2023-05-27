import { calendar_v3, google } from 'googleapis';
import { inject, injectable } from 'tsyringe';
import { Credentials } from 'google-auth-library';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class GetTokensService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(code:string): Promise<[Credentials, calendar_v3.Schema$Event[]]> {
    // const oauth2Client = new google.auth.OAuth2();

    const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, 'https://letsapp.polijrinternal.com');
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });
    const now = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(now.getDate() + 60);
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: endOfWeek.toISOString(),
      maxResults: 10000,
      singleEvents: true,
      orderBy: 'startTime',

    });

    const events = response.data.items;
    if (!events) throw new AppError('SMS not sent', 400);

    const user = await this.usersRepository.findToken();
    if (!user) throw new AppError('User not found', 400);
    if (!tokens.access_token) throw new AppError('Token not found', 400);

    this.usersRepository.updateToken(user.id, tokens.access_token);

    return [tokens, events];
  }
}
