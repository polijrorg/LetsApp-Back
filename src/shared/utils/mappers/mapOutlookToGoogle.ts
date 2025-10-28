import { calendar_v3 } from 'googleapis';

/**
 * Converte um evento do Outlook para o formato do Google Calendar (Schema$Event)
 */
export function mapOutlookToGoogle(input: any): calendar_v3.Schema$Event {
  const isAllDay = !!input.isAllDay;

  const mapAttendees = (attendees: any[] = []): calendar_v3.Schema$EventAttendee[] => {
    return attendees.map((attendee) => {
      const responseMap: Record<string, calendar_v3.Schema$EventAttendee['responseStatus']> = {
        accepted: 'accepted',
        declined: 'declined',
        tentative: 'tentative',
        none: 'needsAction',
      };

      return {
        email: attendee.emailAddress?.address || '',
        displayName: attendee.emailAddress?.name || '',
        responseStatus: responseMap[attendee.status?.response?.toLowerCase()] || 'needsAction',
        optional: attendee.type === 'optional',
      };
    });
  };

  const event: calendar_v3.Schema$Event = {
    id: input.id,
    summary: input.subject || '', // ✅ correto
    description: input.bodyPreview || input.body?.content || '', // ✅ correto
    location: input.location?.displayName || '', // ✅ correto
    start: isAllDay
      ? { date: input.start.dateTime.split('T')[0], timeZone: input.start.timeZone }
      : { dateTime: input.start.dateTime, timeZone: input.start.timeZone },
    end: isAllDay
      ? { date: input.end.dateTime.split('T')[0], timeZone: input.end.timeZone }
      : { dateTime: input.end.dateTime, timeZone: input.end.timeZone },
    attendees: mapAttendees(input.attendees),
    organizer: input.organizer ? {
      email: input.organizer.emailAddress?.address || '',
      displayName: input.organizer.emailAddress?.name || '',
      self: false,
    } : undefined,
    // Campos extras como undefined
    recurrence: undefined,
    reminders: undefined,
    conferenceData: undefined,
    hangoutLink: input.onlineMeeting?.joinUrl || undefined,
    creator: undefined,
    status: undefined,
  };

  return event;
}
