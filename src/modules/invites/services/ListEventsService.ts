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

  public async execute(phone:string): Promise<Invite[]> {
    console.log(phone);
    const invite = this.invitesRepository.listEventsByUser(phone);

    return invite;
  }
}
