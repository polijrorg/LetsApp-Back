import { Invite, User, InviteUser } from '@prisma/client';

import ICreateInviteDTO from '../dtos/ICreateInviteDTO';
// import IUpdateUserDTO from '../dtos/IUpdateUserDTO';
interface IInviteWithConfirmation {
  element: Invite; // Replace 'YourElementType' with the actual type of 'element'
  yes: number;
  no: number;
  maybe: number;
}
interface IInvitesRepository {

  create(data: ICreateInviteDTO): Promise<Invite>;
  listInvitesByUser(email: string): Promise<IInviteWithConfirmation[]>
  listEventsInAWeekByUser(phone: string, beginWeek:string, endWeek:string): Promise<Invite[]>
  listEventsByUser(email: string): Promise<Invite[]>
  UpdatedInviteStatusById(id: string, state:string, email:string): Promise<Invite|null>
  UpdatedInviteById(eventId:string, begin:string, end:string, phone:string): Promise<Invite|null>
  findInviteById(idInvite:string): Promise<Invite|null>;
  findById(id:string): Promise<User|null>;
  findEventByInvite(user: User, invite: Invite): Promise<InviteUser|null>
}

export default IInvitesRepository;
