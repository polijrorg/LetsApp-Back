import { Response } from 'express';
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

  public async authenticate(phone:string): Promise<Response> {
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 180);

    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    // const clientConfig = {
    //   auth: {
    //     clientId: process.env.OUTLOOK_CLIENT_ID as string,
    //     clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
    //   },
    // };

    // const refreshTokenRequest = {
    //   refreshToken: user.tokens as string,
    //   scopes: ['https://graph.microsoft.com/.default'],
    // };

    // const cca = new msal.ConfidentialClientApplication(clientConfig);

    // console.log('aqui');

    // const tokens = await cca.acquireTokenByRefreshToken(refreshTokenRequest);
    // const tokenCache = cca.getTokenCache().serialize();
    // const refreshTokenObject = (JSON.parse(tokenCache)).RefreshToken;
    // const refreshToken = refreshTokenObject[Object.keys(refreshTokenObject)[0]].secret;

    // this.usersRepository.updateToken(user.id, refreshToken);
    // Provavelmente o trecho comentado entrara num bloco try catch em cascata com o bloco de autenticacao via accesToken

    const authProvider = {
      getAccessToken: async () => user.tokens as string,
    };

    const graphClient = Client.initWithMiddleware({ authProvider });
    const events = await graphClient.api(`/users/${user.email}/calendar/events`).get();
    // .filter(`start/dateTime ge '${now.toISOString()}' and end/dateTime le '${end.toISOString()}'`).get();

    return events;
  }
}
