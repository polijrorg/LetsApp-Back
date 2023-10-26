import { inject, injectable } from 'tsyringe';
import msal from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { User } from '@prisma/client';

import AppError from '@shared/errors/AppError';
import axios from 'axios';
import IUsersRepository from '../repositories/IUsersRepository';

interface IUsersVerified {user:User, calendar_found: boolean}
@injectable()
export default class GetUserByPhoneService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute(phone:string): Promise<IUsersVerified> {
    const user = await this.usersRepository.findByPhone(phone);
    if (!user || !user.tokens) throw new AppError('User Not Found or Token Expired', 400);

    try {
      const response = await axios.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${user.tokens}`);
      if (response.data.verified_email) {
        return { user, calendar_found: true };
      }
    } catch (error) {
      console.log(error);
    }

    try {
      const tokenCache = JSON.parse(user.tokens);

      const clientConfig = {
        auth: {
          clientId: process.env.OUTLOOK_CLIENT_ID as string,
          clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
        },
      };

      const cca = new msal.ConfidentialClientApplication(clientConfig);
      cca.getTokenCache().deserialize(tokenCache);

      const account = JSON.parse(cca.getTokenCache().serialize()).Account;

      const tokenRequest = {
        account,
        scopes: ['https://graph.microsoft.com/.default'],
      };

      const tokens = await cca.acquireTokenSilent(tokenRequest);
      if (!tokens) throw new AppError('Token not found', 400);

      const authProvider = {
        getAccessToken: async () => tokens.accessToken as string,
      };

      const graphClient = Client.initWithMiddleware({ authProvider });
      const me = await graphClient.api('/me').get();
      if (me.mail) {
        return { user, calendar_found: true };
      }
    } catch (error) {
      console.log(error);
    }
    return { user, calendar_found: false };
  }
}
