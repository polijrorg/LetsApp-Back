import { inject, injectable } from 'tsyringe';

import { Invite, PseudoUser, User } from '@prisma/client';

// import AppError from '@shared/errors/AppError';
import AppError from '@shared/errors/AppError';
import IInvitesRepository from '../repositories/IInvitesRepository';

interface IInviteWithConfirmation {
  element: Invite; // Replace 'YourElementType' with the actual type of 'element'
  yes: {amount: number, ateendees:User[], pseudoAttendes : PseudoUser[]};
  no: {amount: number, ateendees:User[], pseudoAttendes : PseudoUser[]};
  maybe: {amount: number, ateendees:User[], pseudoAttendes : PseudoUser[]};
}
@injectable()
export default class ListEventsService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async execute(email:string): Promise<IInviteWithConfirmation[]> {
    const user = await this.invitesRepository.findByEmail(email);
    if (!user) throw new AppError('User not found', 400);

    const invite = this.invitesRepository.listEventsByUser(email);

    return invite;
  }
}
