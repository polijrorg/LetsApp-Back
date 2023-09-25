import { inject, injectable } from 'tsyringe';

import { PseudoInvite } from '@prisma/client';

// import AppError from '@shared/errors/AppError';

import IPseudoInvitesRepository from '../repositories/IPseudoInvitesRepository';

interface IUnregisteredGuest {
  id: string;
  email?: string;
  phone?: string;
}

interface IRequest {
  unregisteredGuests: IUnregisteredGuest[];
  unregisteredOptionalGuests: IUnregisteredGuest[];
}

@injectable()
export default class CreatePseudoInviteService {
  constructor(
    @inject('PseudoInvitesRepository')
    private pseudoInvitesRepository: IPseudoInvitesRepository,

  ) { }

  public async execute({ unregisteredGuests, unregisteredOptionalGuests }: IRequest): Promise<PseudoInvite> {
    const pseudoInvite = await this.pseudoInvitesRepository.create({
      guests: unregisteredGuests,
      optionalGuests: unregisteredOptionalGuests,
    });

    return pseudoInvite;
  }
}
