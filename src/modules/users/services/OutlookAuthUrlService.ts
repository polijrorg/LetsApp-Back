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
    const clientConfig = {
      auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID as string,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      },
    };

    const cca = new msal.ConfidentialClientApplication(clientConfig);

    const authCodeUrlParameters = {
      scopes: ['https://graph.microsoft.com/.default'],
      redirectUri: process.env.CLIENT_URI as string,
    };

    const authUrl = cca.getAuthCodeUrl(authCodeUrlParameters);
    return authUrl;
  }
}
