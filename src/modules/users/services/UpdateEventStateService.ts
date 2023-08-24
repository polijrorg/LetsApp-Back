import { calendar_v3, google } from 'googleapis';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
<<<<<<< HEAD
  email: string;
  state: string;
  eventId: string;
=======
    email:string;
    state:number,
    eventId:string,
>>>>>>> fb3f22bf4fa83a174e75a32510b8ea59ed66b1f1
}

@injectable()
export default class UpdateEventStateService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  public async authenticate({
<<<<<<< HEAD
    email,
    state,
    eventId,
  }: IRequest): Promise<calendar_v3.Schema$Event> {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.CLIENT_URI,
    );
=======
    email, state, eventId,
  }:IRequest): Promise<calendar_v3.Schema$Event> {
    // const oauth2Client = new google.auth.OAuth2();
    console.log(eventId);
    const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.CLIENT_URI);
>>>>>>> fb3f22bf4fa83a174e75a32510b8ea59ed66b1f1

    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new AppError('User not found', 400);

    oAuth2Client.setCredentials({ access_token: user.tokens });

    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    // Fetch the event to get attendees
    const eventResponse = await calendar.events.get({
      calendarId: 'primary',
      eventId,
    });

    const event = eventResponse.data;

    // Modify attendee's response status
    const updatedAttendees = event.attendees?.map((attendee) => {
      if (attendee.email === user.email) {
        return {
          ...attendee,
          responseStatus: state,
        };
      }
      return attendee;
    });

    const updatedEvent = {
<<<<<<< HEAD
      attendees: updatedAttendees,
      sendUpdates: 'all',
=======
      attendees: [
        {
          email: attendeeEmail,
          responseStatus: state ? 'accepted' : 'declined',
        },
      ],
>>>>>>> fb3f22bf4fa83a174e75a32510b8ea59ed66b1f1
    };

    // Update the event
    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: updatedEvent,
    });

    return response.data;
  }
}
