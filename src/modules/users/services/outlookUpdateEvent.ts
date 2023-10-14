import msal from '@azure/msal-node';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { Client } from '@microsoft/microsoft-graph-client';
import IInvitesRepository from '@modules/invites/repositories/IInvitesRepository';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class outlookUpdateEvent {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('InivtesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async authenticate(phone:string, idInvite: string): Promise<Response> {
    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    const invite = await this.invitesRepository.findInviteById(idInvite);
    if (!invite) throw new AppError('Invite not found', 400);

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
      originalStartTimeZone: 'originalStartTimeZone-value',
      originalEndTimeZone: 'originalEndTimeZone-value',
      responseStatus: {
        response: '',
        time: 'datetime-value',
      },
      recurrence: null,
      reminderMinutesBeforeStart: 99,
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
      isReminderOn: true,
      hideAttendees: false,
      categories: ['Red category'],
    };

    const updatedEvent = await graphClient.api(`/me/events/${idEvent}`).update(event);

    return updatedEvent;
  }
}
