import { inject, injectable } from 'tsyringe';

import { Invite } from '@prisma/client';

// import AppError from '@shared/errors/AppError';

import ICreateInviteDTO from '../dtos/ICreateInviteDTO';
import IInvitesRepository from '../repositories/IInvitesRepository';

@injectable()
export default class CreateInviteService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async execute({
    address, begin, description, end, beginSearch, endSearch, googleId, guests, pseudoGuests, optionalGuests, pseudoOptionalGuests, link, name, phone, state, organizerPhoto, organizerName,
  }: ICreateInviteDTO): Promise<Invite> {
    const invite = await this.invitesRepository.create({
      address,
      begin,
      description,
      end,
      beginSearch,
      endSearch,
      googleId,
      guests,
      pseudoGuests,
      optionalGuests,
      pseudoOptionalGuests,
      link,
      name,
      phone,
      state,
      organizerPhoto,
      organizerName,
    });

    return invite;
  }
}
