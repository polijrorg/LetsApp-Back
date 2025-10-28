/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-console */
import { inject, injectable, container } from 'tsyringe';

import { Invite, PseudoUser, User } from '@prisma/client';

// import AppError from '@shared/errors/AppError';
import AppError from '@shared/errors/AppError';
import GetGoogleCalendarEventsService from '@modules/users/services/GetGoogleCalendarEventsService';
import { calendar_v3 } from 'googleapis';
import mapGoogleEventToInviteDTO from '@shared/utils/mappers/mapGoogleEventDTO';
import GetOutlookCalendarEvents from '@modules/users/services/GetOutlookCalendarEventsService';
import { mapOutlookToGoogle } from '@shared/utils/mappers/mapOutlookToGoogle';
import IInvitesRepository from '../repositories/IInvitesRepository';
import ICreateInviteDTO from '../dtos/ICreateInviteDTO';

interface IInviteWithConfirmation {
  element: Invite; // Replace 'YourElementType' with the actual type of 'element'
  yes: { amount: number, ateendees: User[], pseudoAttendes: PseudoUser[] };
  no: { amount: number, ateendees: User[], pseudoAttendes: PseudoUser[] };
  maybe: { amount: number, ateendees: User[], pseudoAttendes: PseudoUser[] };
}
@injectable()
export default class ListEventsService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async execute(email: string): Promise<IInviteWithConfirmation[]> {
    console.log(`ListEventsService email: ${email}`);

    const user = await this.invitesRepository.findByEmail(email);
    console.log(`ListEventsService user: ${JSON.stringify(user)}`);

    if (!user) throw new AppError('User not found', 400);

    if (!user.email) {
      throw new AppError('User email not found', 400);
    }
    const invites = await this.invitesRepository.listEventsByUser(user.email);
    console.log(`ListEventsService 36: ${invites}`);
    invites.forEach((invite) => {
      invite.yes.ateendees.forEach((attendee) => {
        // eslint-disable-next-line no-param-reassign
        attendee.tokens = '###';
      });
      invite.no.ateendees.forEach((attendee) => {
        // eslint-disable-next-line no-param-reassign
        attendee.tokens = '###';
      });
      invite.maybe.ateendees.forEach((attendee) => {
        // eslint-disable-next-line no-param-reassign
        attendee.tokens = '###';
      });
    });

    return invites;
  }

  public async getOutlookEvent(email: string): Promise<calendar_v3.Schema$Event[]> {
    const getOutlookCalendarEvents = container.resolve(GetOutlookCalendarEvents);
    console.log(`🔍 getOutlookEvent: Fetching events for ${email}`);
    const events = await getOutlookCalendarEvents.authenticate(email);
    console.log(`📊 Raw Outlook API response: ${JSON.stringify(events).substring(0, 500)}...`);

    const user = await this.invitesRepository.findByEmail(email);
    if (!user) throw new AppError('User not found', 400);

    const mappedEvents: calendar_v3.Schema$Event[] = events?.value.map((event: any) =>
      mapOutlookToGoogle(event) as calendar_v3.Schema$Event);
    console.log(`🗺️ Mapped ${mappedEvents?.length || 0} events to Google format`);

    // Save Outlook events to database (same as Google flow)
    const invitesDTO: ICreateInviteDTO[] = mappedEvents
      .map((event: calendar_v3.Schema$Event) =>
        mapGoogleEventToInviteDTO({
          event,
          phone: user.phone,
          organizerPhoto: user.photo,
          organizerName: event.organizer?.displayName || user.name || 'Organizador',
          beginSearch: event.start?.dateTime || '',
          endSearch: event.end?.dateTime || '',
        }))
      .filter((invite: ICreateInviteDTO | null): invite is ICreateInviteDTO => invite !== null);

    console.log(`💾 Prepared ${invitesDTO.length} invites for database`);

    try {
      const createdInvites = await this.invitesRepository.createMany(invitesDTO);
      console.log('✅ Outlook events created successfully:', createdInvites);
    } catch (error) {
      console.error('❌ Error creating Outlook invites:', error);
    }

    return mappedEvents;
  }

  public async getGoogleEvents(email: string) {
    const getGoogleCalendarEvents = container.resolve(GetGoogleCalendarEventsService);
    const { events, user } = await getGoogleCalendarEvents.authenticate(email);
    if (!events) throw new AppError('Events not found', 400);
    // this.changeEventsData(events);
    // console.log(`ListEventsService 64: events after change: ${JSON.stringify(events)}`);
    // console.log(`ListEventsService 69: events after change: ${JSON.stringify(this.addResponseStatusArrays(events))}`);

    const invitesDTO: ICreateInviteDTO[] = events
      .map((event: calendar_v3.Schema$Event) =>
        // console.log(`Event Email organzer : ${JSON.stringify(event.organizer?.displayName)}`)
        mapGoogleEventToInviteDTO({
          event,
          phone: user.phone,
          organizerPhoto: user.photo,
          organizerName: event.organizer?.displayName || user.name || 'Organizador',
          beginSearch: event.start?.dateTime || '', // Replace 'undefined' with actual value if available
          endSearch: event.end?.dateTime || '', // Replace 'undefined' with actual value if available
        }))
      .filter((invite: ICreateInviteDTO | null): invite is ICreateInviteDTO => invite !== null);
    try {
      const createdInvites = await this.invitesRepository.createMany(invitesDTO);
      console.log('✅ Criado com sucesso:', createdInvites);
    } catch (error) {
      console.error('❌ Erro ao criar múltiplos invites:', error);
    }
    return events;
  }

  public async getEventsUser(email: string): Promise<any[]> {
    const userData = await this.invitesRepository.findByEmail(email);
    console.log(`🔍 ListEventsService getEventsUser: email=${email}, userType=${userData?.type}`);
    if (userData?.type === 'OUTLOOK') {
      console.log(`📅 Fetching OUTLOOK events for ${email}`);
      const events = await this.getOutlookEvent(email);
      console.log(`✅ Retrieved ${events?.length || 0} Outlook events`);
      const processedEvents = this.addResponseStatusArrays(events);
      console.log(`📤 Returning ${processedEvents?.length || 0} processed Outlook events`);
      return processedEvents;
    }
    if (userData?.type === 'GOOGLE') {
      console.log(`📅 Fetching GOOGLE events for ${email}`);
      const events = await this.getGoogleEvents(email);
      return this.addResponseStatusArrays(events);
    }
    console.log('⚠️ No user type matched or user not found. Returning empty array.');
    return [];
  }

  // This method is not implemented in the original code, but you can implement it if needed.
  private addResponseStatusArrays(events: calendar_v3.Schema$Event[]): calendar_v3.Schema$Event[] {
    return events.map((event) => {
      const accepted: calendar_v3.Schema$EventAttendee[] = [];
      const declined: calendar_v3.Schema$EventAttendee[] = [];
      const tentative: calendar_v3.Schema$EventAttendee[] = [];
      const needsAction: calendar_v3.Schema$EventAttendee[] = [];

      event.attendees?.forEach((attendee) => {
        // const email = attendee.email || '';
        const status = attendee.responseStatus;

        if (status === 'accepted') accepted.push(attendee);
        else if (status === 'declined') declined.push(attendee);
        else if (status === 'tentative') tentative.push(attendee);
        else if (status === 'needsAction') needsAction.push(attendee);
      });

      // Create a shallow copy before mutating
      const eventCopy = { ...event } as any;
      eventCopy.accepted = accepted;
      eventCopy.declined = declined;
      eventCopy.tentative = tentative;
      eventCopy.needsAction = needsAction;

      return eventCopy;
    });
  }
}
