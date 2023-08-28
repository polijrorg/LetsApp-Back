import msal from '@azure/msal-node';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class GetTokensService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) { }

  public async authenticate(code: string): Promise<void> {
    // const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.CLIENT_URI);
    // const { tokens } = await oAuth2Client.getToken(code);

    // oAuth2Client.setCredentials(tokens);

    // const userInfo = await google.oauth2('v2').userinfo.get({ auth: oAuth2Client });
    // if (!userInfo.data.email) {
    //   throw new AppError('Email not found in user info', 400);
    // }

    // const user = await this.usersRepository.findByEmail(userInfo.data.email);
    // if (!user) throw new AppError('User not found', 400);
    // if (!tokens.access_token) throw new AppError('Token not found', 400);

    // this.usersRepository.updateToken(user.id, tokens.access_token);
    const clientConfig = {
      auth: {
        clientId: process.env.CLIENT_ID as string,
        clientSecret: process.env.CLIENT_SECRET,
      },
    };

    const cca = new msal.ConfidentialClientApplication(clientConfig);

    const tokenRequest = {
      code,
      redirectUri: process.env.CLIENT_URI as string,
      scopes: ['https://graph.microsoft.com/.default'],
    };

    const tokens = await cca.acquireTokenByCode(tokenRequest);

    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    const userInfo = await response.json();

    // Unificar??
    const user = await this.usersRepository.findByEmail(userInfo.mail);
    if (!user) throw new AppError('User not found', 400);
    if (!tokens.accessToken) throw new AppError('Token not found', 400);

    this.usersRepository.updateToken(user.id, tokens.accessToken);
  }
}
