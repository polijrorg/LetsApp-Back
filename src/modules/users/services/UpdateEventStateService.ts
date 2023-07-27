import { calendar_v3, google } from 'googleapis';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
    phone:string;
    state:string,
    eventId:string,
}
@injectable()
export default class UpdateEventStateService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    phone, state, eventId,
  }:IRequest): Promise<calendar_v3.Schema$Event> {
    // const oauth2Client = new google.auth.OAuth2();

    const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.CLIENT_URI);

    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    oAuth2Client.setCredentials({ access_token: user.tokens });

    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,

    });

    const attendeeEmail = user.email;

    const updatedEvent = {
      attendees: [
        {
          email: attendeeEmail,
          responseStatus: state,
        },
      ],
    };

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: updatedEvent,
    });

    return response.data;
  }
}
