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
    if (!user) throw new AppError('User Not Found', 400);

    // If user doesn't have tokens yet, they haven't connected a calendar
    // This is a normal state for new users, not an error
    if (!user.tokens) {
      return { user, calendar_found: false };
    }

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
          authority: 'https://login.microsoftonline.com/common',
        },
        system: {
          loggerOptions: {
            loggerCallback(loglevel: any, message: any, containsPii: any) {
              console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: 3,
          }
        }
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
