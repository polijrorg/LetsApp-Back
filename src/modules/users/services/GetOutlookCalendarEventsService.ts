import msal from '@azure/msal-node';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { Client } from '@microsoft/microsoft-graph-client';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class GetOutlookCalendarEvents {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(phone:string): Promise<void> {
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 180);

    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    const tokenCache = JSON.parse(user.token!);

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

    // const tokens = await cca.acquireTokenByClientCredential(tokenRequest);
    const tokens = await cca.acquireTokenSilent(tokenRequest);
    if (!tokens) throw new AppError('Token not found', 400);

    // const expirationDate = new Date(user.microsoftExpiresIn as string);

    // const getAccessToken = async (): Promise<{ accessToken: string | null } | msal.AuthenticationResult | null> => {
    //   if (now > expirationDate) {
    //     const tokens = await cca.acquireTokenByRefreshToken(refreshTokenRequest);
    //     const microsoftExpiresIn = tokens?.expiresOn as Date;
    //     await this.usersRepository.updateToken(user.id, tokens?.accessToken as string);
    //     await this.usersRepository.updateMicrosoftExpiresIn(user.id, microsoftExpiresIn.toString());
    //     return tokens;
    //   }
    //   const tokens = {
    //     accessToken: user.token,
    //   };
    //   return tokens;
    // };

    // const token = await getAccessToken();

    const authProvider = {
      getAccessToken: async () => tokens.accessToken as string,
    };

    // ${user.email}

    const graphClient = Client.initWithMiddleware({ authProvider });
    const events = await graphClient.api(`/users/${user.email}/calendar/events`).filter(`start/dateTime ge '${now.toISOString()}' and end/dateTime le '${end.toISOString()}'`).get();

    return events;
  }
}
