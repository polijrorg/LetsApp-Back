import msal from '@azure/msal-node';
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
      },
    };

    const cca = new msal.ConfidentialClientApplication(clientConfig);

    const authCodeUrlParameters = {
      scopes: ['https://graph.microsoft.com/.default'],
      redirectUri: process.env.OUTLOOK_CLIENT_URI as string,
      state: phone,
    };

    const authCodeUrl = cca.getAuthCodeUrl(authCodeUrlParameters);
    return authCodeUrl;
  }
}
