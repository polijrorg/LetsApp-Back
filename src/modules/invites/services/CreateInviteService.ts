import { inject, injectable, container } from 'tsyringe';
import UsersRepository from '@modules/users/infra/prisma/repositories/UsersRepository';
import PseudoUsersRepository from '@modules/pseudousers/infra/prisma/repositories/PseudoUsersRepository';

import { Invite } from '@prisma/client';

// import AppError from '@shared/errors/AppError';

import CreatePseudoUserService from '@modules/users/services/CreatePseudoUserService';
import ICreateInviteDTO from '../dtos/ICreateInviteDTO';
import IInvitesRepository from '../repositories/IInvitesRepository';

const usersRepository = container.resolve(UsersRepository);
const pseudoUsersRepository = container.resolve(PseudoUsersRepository);
const createPseudoUserService = container.resolve(CreatePseudoUserService);

@injectable()
export default class CreateInviteService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async execute({
    address, begin, description, end, googleId, guests, link, name, phone, state, organizerPhoto, organizerName, optionalGuests,
  }: ICreateInviteDTO): Promise<Invite> {
    guests.forEach((guest) => {
      const userAlreadyExists = usersRepository.findByEmail(guest);
      const pseudoUserAlreadyExists = pseudoUsersRepository.findByEmail(guest);
      if (!userAlreadyExists && !pseudoUserAlreadyExists) {
        createPseudoUserService.execute({ email: guest, phone: null });
      }
    });

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
