import { inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

import AppError from '@shared/errors/AppError';

import IInvitesRepository from '@modules/invites/repositories/IInvitesRepository';
import IUsersRepository from '../repositories/IUsersRepository';
import IPseudoUsersRepository from '../repositories/IPseudoUsersRepository';

interface IRequest {
  phone:string;
}

@injectable()
export default class DeleteUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

    @inject('PseudoUsersRepository')
    private pseudoUsersRepository: IPseudoUsersRepository,

  ) { }

  public async execute({ phone }: IRequest): Promise<User> {
    const user = await this.usersRepository.findByPhone(phone);
    if (!user || !user.name) throw new AppError('User not found or name not registered');

    const invites = await this.invitesRepository.findInvitesByOrganizerName(user.name);

    if (!invites) {
      const deletedUser = await this.usersRepository.delete(user.phone);
      return deletedUser;
    }

    const reponses = invites.map(async (invite) => {
      await this.invitesRepository.delete(invite.id);
    });

    await Promise.all(reponses);

    const deletedUser = await this.usersRepository.delete(user.phone);
    return deletedUser;
  }
}
