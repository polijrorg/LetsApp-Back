import { Invite } from '@prisma/client';

import ICreateInviteDTO from '../dtos/ICreateInviteDTO';
// import IUpdateUserDTO from '../dtos/IUpdateUserDTO';

interface IInvitesRepository {

  create(data: ICreateInviteDTO): Promise<Invite>;
  listInvitesByUser(email: string): Promise<Invite[]>
  listEventsInAWeekByUser(phone: string, beginWeek:string, endWeek:string): Promise<Invite[]>
  listEventsByUser(email: string): Promise<Invite[]>
  UpdatedInviteStatusById(id: string, state:string, email:string): Promise<Invite|null>
  listUserEmailByInvite(id: string): Promise<string[]>
}

export default IInvitesRepository;
