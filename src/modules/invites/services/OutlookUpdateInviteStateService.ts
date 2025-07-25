/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
import msal from '@azure/msal-node';
import { inject, injectable } from 'tsyringe';
import { InviteUser } from '@prisma/client';
import AppError from '@shared/errors/AppError';
import { Client } from '@microsoft/microsoft-graph-client';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import IInvitesRepository from '../repositories/IInvitesRepository';

@injectable()
export default class OutlookUpdateInviteState {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute(email: string, idInvite: string, state: string): Promise<InviteUser> {
    const user = await this.invitesRepository.findByEmail(email);
    if (!user) throw new AppError('User not found user OutlookUptadeInStateServices', 400);

    const invite = await this.invitesRepository.findInviteById(idInvite);
    if (!invite) throw new AppError('Invite not found', 400);

    const tokenCache = JSON.parse(user.tokens!);

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
        },
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

    const accept = {
      comment: 'comment-value',
      sendResponse: true,
    };

    const decline = {
      sendResponse: true,
    };

    const inviteUser = await this.invitesRepository.findEventByInvite(user, invite);
    if (!inviteUser) throw new AppError('inviteUser not found, user do not match with the invite', 400);

    const events = await graphClient.api(`users/${user.email}/calendar/events`).header('Prefer', 'outlook.timezone="America/Sao_Paulo"').get();

    let idEvent = null;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; events.value[i] != null; i++) {
      if ((events.value[i].subject === invite.name) && (events.value[i].start.dateTime.slice(0, 19) === invite.begin) && (events.value[i].end.dateTime.slice(0, 19) === invite.end)) {
        idEvent = events.value[i].id;
      }
    }
    if (!idEvent) throw new AppError('Users invite not found', 400);

    if (state === 'accepted') {
      await graphClient.api(`users/${user.email}/calendar/events/${idEvent}/accept`).post(accept);
    } else if (state === 'declined') {
      await graphClient.api(`users/${user.email}/calendar/events/${idEvent}/decline`).post(decline);
    } else { throw new AppError('Invalid status'); }

    return inviteUser;
  }
}
