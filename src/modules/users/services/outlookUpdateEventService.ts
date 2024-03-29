import msal from '@azure/msal-node';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { Client } from '@microsoft/microsoft-graph-client';
import IInvitesRepository from '@modules/invites/repositories/IInvitesRepository';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  idInvite:string,
  email:string,
  begin:string,
  end:string
}

@injectable()
export default class outlookUpdateEvent {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async authenticate({
    email, idInvite, begin, end,
  }: IRequest): Promise<Response> {
    const invite = await this.usersRepository.findInvite(idInvite);
    if (!invite) throw new AppError('Invite not found', 400);

    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new AppError('User not found', 400);

    if (!user.tokens) throw new AppError('Token not found', 400);

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

    const events = await graphClient.api(`users/${user.email}/calendar/events`).header('Prefer', 'outlook.timezone="America/Sao_Paulo"').get();

    let idEvent = null;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; events.value[i] != null; i++) {
      if ((events.value[i].subject === invite.name) && (events.value[i].start.dateTime.slice(0, 19) === invite.begin) && (events.value[i].end.dateTime.slice(0, 19) === invite.end)) {
        idEvent = events.value[i].id;
      }
    }
    if (!idEvent) throw new AppError('Users invite not found', 400);

    const event = {
      subject: invite.name,
      bodyPreview: invite.description,
      start: { dateTime: `${begin}.0000000`, timeZone: 'America/Sao_Paulo' },
      end: { dateTime: `${end}.0000000`, timeZone: 'America/Sao_Paulo' },
      recurrence: null,
      isOnlineMeeting: false,
      hideAttendees: false,
    };

    const updatedEvent = await graphClient.api(`/me/events/${idEvent}`).header('Prefer', 'outlook.timezone="America/Sao_Paulo"').update(event);

    return updatedEvent;
  }
}
