import msal from '@azure/msal-node';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { Client } from '@microsoft/microsoft-graph-client';
import IInvitesRepository from '@modules/invites/repositories/IInvitesRepository';
import { google } from 'googleapis';

@injectable()
export default class CheckUserAvailabilityService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async execute(id: string, inviteId: string): Promise<boolean> {
    const user = await this.invitesRepository.findById(id);
    if (!user || !user.email) throw new AppError('User not found or user`s email not found', 400);

    const invite = await this.invitesRepository.findInviteById(inviteId);
    if (!invite) throw new AppError('Invite not found', 400);

    if (user.type === 'OUTLOOK') {
      const tokenCache = JSON.parse(user.tokens!);
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

      for (let i = 0; i < availability.length; i += 1) {
        if (availability[i] !== '0') {
          return false;
        }
      }
      return true;
    }

    const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CLIENT_URI);

    oAuth2Client.setCredentials({ access_token: user.tokens });

    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    const check = {
      auth: oAuth2Client,
      resource: {
        timeMin: new Date(invite.begin),
        timeMax: new Date(invite.end),
        items: [
          { id: user.email },
        ],
      },
    };

    const response = await calendar.freebusy.query(check);

    const busyArray = response.data.calendars![user.email!].busy;
    if (busyArray!.length === 0) return true;

    return false;
  }
}
