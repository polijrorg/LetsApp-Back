import { Invite } from '@prisma/client';

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
}

export default IInvitesRepository;
