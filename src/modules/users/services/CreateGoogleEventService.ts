/* eslint-disable no-console */
import { google } from 'googleapis';
import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import CreateInviteService from '@modules/invites/services/CreateInviteService';
import { Invite } from '@prisma/client';
import IUsersRepository from '../repositories/IUsersRepository';
import UserManagementService from './UserManagementService';

interface IRequest {
    phone:string;
    begin:string; end:string;
    beginSearch:string; endSearch:string;
    attendees:string[];
    description:string;
    address:string;
    createMeetLink:boolean;
    name:string;
    optionalAttendees:string[];

}
@injectable()
export default class CreateGoogleEventService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async createGoogleCalendarEvent({
    address, attendees, begin, createMeetLink, description, end, beginSearch, endSearch, phone, name, optionalAttendees,
  }:IRequest): Promise<Invite> {
    // To create the invite we need a valid full-registered-users guest list.
    // In order to achieve this, we call a service that separates the guests into four lists:
    const userManagementService = container.resolve(UserManagementService);

    const {
      guests, pseudoGuests, optionalGuests, pseudoOptionalGuests,
    } = await userManagementService.execute(attendees, optionalAttendees);

    const attendeesEmail = [...guests, ...optionalGuests];
    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);
    const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.GOOGLE_CLIENT_URI}`);

    oAuth2Client.setCredentials({ access_token: user.tokens });

    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,

    });

    // eslint-disable-next-line no-plusplus
    const resolvedEmails = await Promise.all(
      attendeesEmail.map(async (item) => {
        if (item.includes('@')) return item;
        try {
          return await this.usersRepository.findEmailByPhone(item);
        } catch (error) {
          console.warn(`Erro ao buscar email para ${item}: ${error}`);
          return null;
        }
      }),
    );

    const finalAttendees = resolvedEmails
      .filter((email): email is string => Boolean(email))
      .map((email) => ({ email }));

    const event = {
      summary: name,
      description,
      location: address,
      attendees: finalAttendees,
      start: {
        dateTime: begin,
        timeZone: Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo' }).resolvedOptions().timeZone,
      },
      end: {
        dateTime: end,
        timeZone: Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo' }).resolvedOptions().timeZone,
      },
      conferenceData: {
        createRequest: {
          requestId: 'random_id',
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    let back;
    if (createMeetLink) {
      back = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,

      });
    } else {
      back = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        sendUpdates: 'all',

      });
    }

    const CreateInviteEvent = container.resolve(CreateInviteService);
    const state = 'accepted';
    const invite = await CreateInviteEvent.execute({
      name,
      begin,
      end,
      beginSearch,
      endSearch,
      guests,
      optionalGuests,
      pseudoGuests,
      pseudoOptionalGuests,
      phone,
      description,
      address,
      link: back.data.hangoutLink,
      state,
      googleId: back.data.id || 'none',
      organizerPhoto: user.photo,
      organizerName: user.name || 'organizer',
    });

    return invite;
  }
}
