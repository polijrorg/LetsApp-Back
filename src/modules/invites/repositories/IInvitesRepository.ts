import { Invite } from '@prisma/client';

import ICreateInviteDTO from '../dtos/ICreateInviteDTO';
// import IUpdateUserDTO from '../dtos/IUpdateUserDTO';

interface IInvitesRepository {

  create(data: ICreateInviteDTO): Promise<Invite>;
  listInvitesByUser(phone: string): Promise<Invite[]>
  listEventsByUser(phone: string): Promise<Invite[]>
}

export default IInvitesRepository;
