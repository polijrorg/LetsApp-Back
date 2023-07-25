import { Invite } from '@prisma/client';

import ICreateInviteDTO from '../dtos/ICreateInviteDTO';
// import IUpdateUserDTO from '../dtos/IUpdateUserDTO';

interface IInvitesRepository {

  create(data: ICreateInviteDTO): Promise<Invite>;
  listAll(): Promise<Invite[]>;

}

export default IInvitesRepository;
