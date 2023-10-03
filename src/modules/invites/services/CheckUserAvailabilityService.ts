import msal from '@azure/msal-node';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { Client } from '@microsoft/microsoft-graph-client';
import IInvitesRepository from '@modules/invites/repositories/IInvitesRepository';

@injectable()
export default class CheckUserAvailabilityService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async execute(id: string, idInvite: string): Promise<boolean> {
    const user = await this.invitesRepository.findById(id);
    if (!user) throw new AppError('User not found', 400);

    const invite = await this.invitesRepository.findInviteById(idInvite);
    if (!invite) throw new AppError('Invite not found', 400);

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

    const tokens = await cca.acquireTokenSilent(tokenRequest);
    if (!tokens) throw new AppError('Token not found', 400);

    const authProvider = {
      getAccessToken: async () => tokens.accessToken as string,
    };

    const graphClient = Client.initWithMiddleware({ authProvider });

    const scheduleInformation = {
      schedules: [user.email],
      startTime: {
        dateTime: invite.begin,
        timeZone: 'America/Sao_Paulo',
      },
      endTime: {
        dateTime: invite.end,
        timeZone: 'America/Sao_Paulo',
      },
      availabilityViewInterval: 30,
    };

    const check = await graphClient.api(`/users/${user.email}/calendar/getSchedule`).header('Prefer', 'outlook.timezone="America/Sao_Paulo"').post(scheduleInformation);

    const availability = check.value[0].availabilityView;

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < availability.length; i++) {
      if (availability[i] !== '0') {
        return false;
      }
    }
    return true;
  }
}
