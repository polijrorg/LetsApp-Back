import msal from '@azure/msal-node';
import { Event } from '@microsoft/microsoft-graph-types';
import { Client } from '@microsoft/microsoft-graph-client';
import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import CreateInviteService from '@modules/invites/services/CreateInviteService';
import { Invite } from '@prisma/client';

import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  phone:string;
  begin:string; end:string;
  attendees:string[];
  description:string;
  address:string;
  name:string;
  optionalAttendees:string[];
}

@injectable()
export default class CreateOutlookCalendarEventService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    phone, begin, end, attendees, description, address, name, optionalAttendees,
  }: IRequest): Promise<Invite> {
    // const oauth2Client = new google.auth.OAuth2();
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

    const tokens = await cca.acquireTokenSilent(tokenRequest);
    if (!tokens) throw new AppError('Token not found', 400);

    const authProvider = {
      getAccessToken: async () => tokens.accessToken as string,
    };

    const graphClient = Client.initWithMiddleware({ authProvider });

    const event: Event = {
      subject: name,
      bodyPreview: description,
      location: {
        address:
        { street: address },
      },
      start: {
        dateTime: begin,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: attendees.map((email) => ({
        emailAddress: {
          address: email,
        },
        type: 'required',
      })),
    };

    await graphClient.api('me/events').post(event);

    const link = 'link';
    const googleId = 'googleId';

    const CreateInviteEvent = container.resolve(CreateInviteService);
    const state = 'accepted';
    const invite = await CreateInviteEvent.execute({
      name,
      begin,
      end,
      guests: attendees,
      optionalGuests: optionalAttendees,
      phone,
      description,
      address,
      link,
      state,
      googleId,
      organizerPhoto: user.photo,
      organizerName: user.name!,
    });

    return invite;
  }
}
