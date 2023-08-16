import { container, inject, injectable } from 'tsyringe';

import { Invite } from '@prisma/client';

// import AppError from '@shared/errors/AppError';
import AppError from '@shared/errors/AppError';
import UpdateEventStateService from '@modules/users/services/UpdateEventStateService';
import IInvitesRepository from '../repositories/IInvitesRepository';

@injectable()
export default class UpdateEventService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async execute(inviteId:string, status:number, email:string): Promise<Invite> {
    const invite = await this.invitesRepository.UpdatedInviteStatusById(inviteId, status, email);

    if (!invite) throw new AppError('Invite Not Found', 400);

    console.log(inviteId, status, email);
    const urlservice = container.resolve(UpdateEventStateService);
    await urlservice.authenticate({
      email, state: status, eventId: invite.googleId,
    });

    return invite;
  }
}
