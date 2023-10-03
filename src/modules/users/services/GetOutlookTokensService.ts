import msal from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class GetOutlookTokensService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) { }

  public async authenticate(code: string, phone: string): Promise<void> {
    const clientConfig = {
      auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID as string,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      },
    };

    const tokenRequest = {
      code,
      redirectUri: process.env.OUTLOOK_CLIENT_URI as string,
      scopes: ['https://graph.microsoft.com/.default'],
    };

    const cca = new msal.ConfidentialClientApplication(clientConfig);
    const tokens = await cca.acquireTokenByCode(tokenRequest);
    if (!tokens.accessToken) throw new AppError('Token not found', 400);

    const tokenCache = JSON.stringify(cca.getTokenCache().serialize());

    const authProvider = {
      getAccessToken: async () => tokens.accessToken,
    };

    const graphClient = Client.initWithMiddleware({ authProvider });
    const userInfo = await graphClient.api('/me').get();

    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);
    await this.usersRepository.updateEmail(user.id, userInfo.mail);
    this.usersRepository.updateToken(user.id, tokenCache);

    this.usersRepository.updateUserType(user.id, 'OUTLOOK');
  }
}
