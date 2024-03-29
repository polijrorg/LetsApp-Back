import { google } from 'googleapis';
import { injectable, inject } from 'tsyringe';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class GoogleAuthUrlService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(phone: string): Promise<string> {
    const oauth2Client = new google.auth.OAuth2();

    const scopes = ['https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.events.readonly',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.settings.readonly',
      'https://www.googleapis.com/auth/userinfo.email'];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_CLIENT_URI,
      state: phone,
    });

    return authUrl;
  }
}
