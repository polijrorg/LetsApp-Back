import { calendar_v3 } from 'googleapis';

export interface ICustomEventDTO extends calendar_v3.Schema$Event {
  accepted?: calendar_v3.Schema$Event[]
  declined?: calendar_v3.Schema$Event[]
  tentative?:calendar_v3.Schema$Event[]
  needsAction?: calendar_v3.Schema$Event[]
}
export interface IEventWithAttendeesStatus {
  id?: string;
  summary?: string;
  accepted: string[];
  declined: string[];
  tentative: string[];
  needsAction: string[];
}
