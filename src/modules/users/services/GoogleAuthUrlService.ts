import msal from '@azure/msal-node';
import { injectable, inject } from 'tsyringe';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class GoogleAuthUrlService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(): Promise<string> {
    // const oauth2Client = new google.auth.OAuth2();

    // const scopes = ['https://www.googleapis.com/auth/calendar',
    //   'https://www.googleapis.com/auth/calendar.events',
    //   'https://www.googleapis.com/auth/calendar.events.readonly',
    //   'https://www.googleapis.com/auth/calendar.readonly',
    //   'https://www.googleapis.com/auth/calendar.settings.readonly',
    //   'https://www.googleapis.com/auth/userinfo.email'];

    // const authUrl = oauth2Client.generateAuthUrl({
    //   access_type: 'offline',
    //   scope: scopes,
    //   client_id: process.env.CLIENT_ID,
    //   redirect_uri: process.env.CLIENT_URI,

    // });

    // return authUrl;
    const clientConfig = {
      auth: {
        clientId: process.env.CLIENT_ID as string,
        clientSecret: process.env.CLIENT_SECRET,
      },
    };

    const cca = new msal.ConfidentialClientApplication(clientConfig);

    const authCodeUrlParameters = {
      scopes: ['user.read', 'calendars.read', 'calendars.readwrite', 'calendars.read.shared', 'calendars.readwrite.shared'],
      redirectUri: process.env.CLIENT_URI as string,
    };

    const url = cca.getAuthCodeUrl(authCodeUrlParameters);
    return url;
  }
}
