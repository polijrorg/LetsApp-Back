import { calendar_v3 } from 'googleapis';
import ICreateInviteDTO from '@modules/invites/dtos/ICreateInviteDTO';

interface IParams {
  event: calendar_v3.Schema$Event;
  phone: string;
  organizerPhoto: string | null;
  organizerName: string;
  beginSearch: string;
  endSearch: string;
}

export default function mapGoogleEventToInviteDTO({
  event,
  phone,
  organizerPhoto,
  organizerName,
  beginSearch,
  endSearch,
}: IParams): ICreateInviteDTO | null {
  if (!event.id) {
    console.warn('⚠️ Evento do Google sem ID, será ignorado:', event);
    return null;
  }

  const begin = event.start?.dateTime ?? event.start?.date;
  const end = event.end?.dateTime ?? event.end?.date;

  if (!begin || !end) {
    console.warn('⚠️ Evento do Google sem data de início/fim:', event);
    return null;
  }
  if (typeof event.id !== 'string' || event.id.trim() === '') {
    console.warn('⚠️ Evento do Google com ID inválido:', event);
    return null;
  }
  return {
    name: event.summary || 'Evento sem título',
    begin,
    end,
    beginSearch,
    endSearch,
    phone,
    description: event.description || '',
    address: event.location || '',
    guests: (event.attendees || [])
      .filter(a => a.optional !== true && !!a.email)
      .map(a => a.email!),
    optionalGuests: (event.attendees || [])
      .filter(a => a.optional === true && !!a.email)
      .map(a => a.email!),
    pseudoGuests: [],
    pseudoOptionalGuests: [],
    link: event.hangoutLink || '',
    state: 'accepted',
    googleId: event.id,
    organizerPhoto,
    organizerName,
  };
}
