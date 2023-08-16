import { inject, injectable } from 'tsyringe';

import { Invite } from '@prisma/client';

// import AppError from '@shared/errors/AppError';
import IInvitesRepository from '../repositories/IInvitesRepository';

@injectable()
export default class ListEventsService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async execute(email:string): Promise<Invite[]> {
    const invite = this.invitesRepository.listEventsByUser(email);

    return invite;
  }
}
