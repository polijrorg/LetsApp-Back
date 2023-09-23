import { PseudoInvite } from '@prisma/client';

import ICreatePseudoInviteDTO from '../dtos/ICreatePseudoInviteDTO';

interface IPseudoInvitesRepository {

  create(data: ICreatePseudoInviteDTO): Promise<PseudoInvite>;
}

export default IPseudoInvitesRepository;
