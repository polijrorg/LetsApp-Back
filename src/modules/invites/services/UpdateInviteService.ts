import { container, inject, injectable } from 'tsyringe';

import { Invite } from '@prisma/client';

// import AppError from '@shared/errors/AppError';
import AppError from '@shared/errors/AppError';
import UpdateEventService from '@modules/users/services/UpdateEventService';
import IInvitesRepository from '../repositories/IInvitesRepository';

interface IRequest {eventId: string, begin: string, end: string, phone: string, }
@injectable()
export default class UpdateInviteService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async execute({
    eventId, begin, end, phone,
  }:IRequest): Promise<Invite> {
    const invite = await this.invitesRepository.UpdatedInviteById(

      eventId,
      begin,
      end,
      phone,

    );

    if (!invite) throw new AppError('Invite Not Found', 400);

    const urlservice = container.resolve(UpdateEventService);
    await urlservice.authenticate({
      eventId: invite.googleId,
      phone,
      begin,
      end,
    });

    return invite;
  }
}
