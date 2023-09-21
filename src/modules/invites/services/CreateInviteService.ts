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
    address, begin, description, end, googleId, guests, link, name, phone, state, organizerPhoto, organizerName, optionalGuests,
  }: ICreateInviteDTO): Promise<Invite> {
    const invite = await this.invitesRepository.create({
      address,
      begin,
      description,
      end,
      googleId,
      guests,
      link,
      name,
      phone,
      state,
      organizerPhoto,
      organizerName,
      optionalGuests,
    });

    return invite;
  }
}
