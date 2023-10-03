import { google } from 'googleapis';
import { inject, injectable, container } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { Invite } from '@prisma/client';
import UpdateInviteService from '@modules/invites/services/UpdateInviteService';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  eventId:string,
  phone:string,
  begin:string,
  end:string
}

interface IResponse {
  invite: Invite;
  calendarEvent: any;
}

@injectable()
export default class UpdateEventService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    begin, end, phone, eventId,
  }:IRequest): Promise<IResponse> {
    // const oauth2Client = new google.auth.OAuth2();

    const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CLIENT_URI);

    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    oAuth2Client.setCredentials({ access_token: user.tokens });

    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,

    });
    // const emails = attendees.map((email) => ({ email }));

    const event = {

      start: {
        dateTime: begin,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },

    };

    const calendarEvent = await calendar.events.patch({
      eventId,
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all',
    });

    const urlService = await container.resolve(UpdateInviteService);

    const invite = await urlService.execute({
      eventId,
      phone,
      begin,
      end,
    });

    return { invite, calendarEvent };
  }
}
