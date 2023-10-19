import {
  Invite, User, InviteUser, PseudoUser, PseudoInviteUser,
} from '@prisma/client';

import ICreateInviteDTO from '../dtos/ICreateInviteDTO';
// import IUpdateUserDTO from '../dtos/IUpdateUserDTO';
interface IInviteWithConfirmation {
  element: Invite; // Replace 'YourElementType' with the actual type of 'element'
  yes: {amount: number, ateendees:User[], pseudoAttendes : PseudoUser[]};
  no: {amount: number, ateendees:User[], pseudoAttendes : PseudoUser[]};
  maybe: {amount: number, ateendees:User[], pseudoAttendes : PseudoUser[]};
}
interface IInvitesRepository {

  create(data: ICreateInviteDTO): Promise<Invite>;
  listInvitesByUser(email: string): Promise<IInviteWithConfirmation[]>
  listEventsInAWeekByUser(phone: string, beginWeek:string, endWeek:string): Promise<Invite[]>
  listEventsByUser(email: string): Promise<IInviteWithConfirmation[]>
  UpdatedInviteStatusById(id: string, state:string, email:string): Promise<Invite|null>
  UpdatedInviteById(eventId:string, begin:string, end:string, phone:string): Promise<Invite|null>
  findInviteById(idInvite:string): Promise<Invite|null>;
  findById(id:string): Promise<User|null>;
  findByEmail(email:string): Promise<User|null>;
  findEventByInvite(user: User, invite: Invite): Promise<InviteUser|null>
  findInviteByPseudoUser(pseudoUser: PseudoUser): Promise<Invite|null>
  connect(user: User, invite: Invite): Promise<InviteUser>
  findInvitesByOrganizerName(eventId:string): Promise<(Invite & { pseudoGuests: PseudoInviteUser[] })[] | null>;
  delete(id:string): Promise<Invite|null>;
}

export default IInvitesRepository;
