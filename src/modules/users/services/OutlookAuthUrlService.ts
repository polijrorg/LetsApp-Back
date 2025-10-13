import msal, { ResponseMode } from '@azure/msal-node';
import { injectable, inject } from 'tsyringe';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class OutlookAuthUrlService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(phone: string): Promise<string> {
    const clientConfig = {
      auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID as string,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
        authority: 'https://login.microsoftonline.com/common',
      },
      system: {
        loggerOptions: {
          loggerCallback(loglevel: any, message: any, containsPii: any) {
            console.log(`Mesagem after loggin ${message}`);
          },
          piiLoggingEnabled: false,
          logLevel: 3,
        }
      }
    };

    const cca = new msal.ConfidentialClientApplication(clientConfig);

    const authCodeUrlParameters = {
      scopes: ['openid','profile', 'offline_access', 'User.Read', 'Calendars.ReadWrite', 'OnlineMeetings.ReadWrite'],
      redirectUri: process.env.OUTLOOK_CLIENT_URI as string,
      state: phone,
      responseMode: ResponseMode.QUERY
    };

    const authCodeUrl = cca.getAuthCodeUrl(authCodeUrlParameters);
    return authCodeUrl;
  }
}
