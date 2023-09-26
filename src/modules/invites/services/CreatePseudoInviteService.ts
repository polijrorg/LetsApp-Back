import { inject, injectable } from 'tsyringe';

import { PseudoInvite } from '@prisma/client';

// import AppError from '@shared/errors/AppError';

import IPseudoInvitesRepository from '../repositories/IPseudoInvitesRepository';

interface IRequest {
  pseudoGuests: string[];
  pseudoOptionalGuests: string[];
}

@injectable()
export default class CreatePseudoInviteService {
  constructor(
    @inject('PseudoInvitesRepository')
    private pseudoInvitesRepository: IPseudoInvitesRepository,

  ) { }

  public async execute({ pseudoGuests, pseudoOptionalGuests }: IRequest): Promise<PseudoInvite> {
    const pseudoInvite = await this.pseudoInvitesRepository.create({
      guests: pseudoGuests,
      optionalGuests: pseudoOptionalGuests,
    });

    return pseudoInvite;
  }
}
