import { container, inject, injectable } from 'tsyringe';

import { Invite } from '@prisma/client';

// import AppError from '@shared/errors/AppError';
import AppError from '@shared/errors/AppError';
import UpdateEventStateService from '@modules/users/services/UpdateEventStateService';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import IInvitesRepository from '../repositories/IInvitesRepository';
import OutlookUpdateInviteState from './OutlookUpdateInviteStateService';

@injectable()
export default class UpdateInviteStateService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute(inviteId:string, state:string, email:string): Promise<Invite> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new AppError('User not found', 400);

    const userType = await this.usersRepository.findTypeByEmail(email);

    if (userType === 'GOOGLE') {
      const invite = await this.invitesRepository.UpdatedInviteStatusById(inviteId, state, email);
      if (!invite) throw new AppError('Invite Not Found', 400);

      const urlservice = container.resolve(UpdateEventStateService);
      await urlservice.updateEventState({
        email, state, eventId: invite.googleId,
      });
      return invite;
    }
    const invite = await this.invitesRepository.UpdatedInviteStatusById(inviteId, state, email);
    if (!invite) throw new AppError('Invite Not Found', 400);

    const urlservice = container.resolve(OutlookUpdateInviteState);
    await urlservice.execute(inviteId, state, email);
    return invite;
  }
}
