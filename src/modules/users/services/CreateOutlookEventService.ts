import msal from '@azure/msal-node';
import { Event } from '@microsoft/microsoft-graph-types';
import { Client } from '@microsoft/microsoft-graph-client';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';

import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  subject: string
  startTime: string,
  endTime: string,
  email: string,
}

@injectable()
export default class CreateOutlookCalendarEventService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    subject, startTime, endTime, email,
  }: IRequest): Promise<void> {
    // const oauth2Client = new google.auth.OAuth2();
    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new AppError('User not found', 400);

    const clientConfig = {
      auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID as string,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      },
      // cache: {
      //   cacheLocation: 'memoryStorage',
      // },
    };

    const refreshTokenRequest = {
      scopes: ['https://graph.microsoft.com/.default'],
      refreshToken: user.microsoftRefreshCode as string,
    };

    const cca = new msal.ConfidentialClientApplication(clientConfig);

    const now = new Date();
    const expirationDate = new Date(user.microsoftExpiresIn as string);

    const getAccessToken = async (): Promise<{ accessToken: string | null } | msal.AuthenticationResult | null> => {
      if (now > expirationDate) {
        const tokens = await cca.acquireTokenByRefreshToken(refreshTokenRequest);
        const microsoftExpiresIn = tokens?.expiresOn as Date;
        await this.usersRepository.updateToken(user.id, tokens?.accessToken as string);
        await this.usersRepository.updateMicrosoftExpiresIn(user.id, microsoftExpiresIn.toString());
        return tokens;
      }
      const tokens = {
        accessToken: user.token,
      };
      return tokens;
    };

    const token = await getAccessToken();

    const authProvider = {
      getAccessToken: async () => token?.accessToken as string,
    };

    const graphClient = Client.initWithMiddleware({ authProvider });

    console.log(graphClient);

    const event: Event = {
      subject: 'Prep for customer meeting',
      start: {
        dateTime: '2023-09-12T13:00:00',
        timeZone: 'Pacific Standard Time',
      },
      end: {
        dateTime: '2023-09-12T14:00:00',
        timeZone: 'Pacific Standard Time',
      },
      attendees: [
        {
          emailAddress: {
            address: 'contasntec@polijunior.com.br',
          },
        },
        {
          emailAddress: {
            address: 'danteodesousa@gmail.com',
          },
        },
      ],
    };

    await graphClient.api('me/events').post(event);
  }
}
