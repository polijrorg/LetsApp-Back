import { inject, injectable } from 'tsyringe';

import { Invite } from '@prisma/client';

// import AppError from '@shared/errors/AppError';
import IInvitesRepository from '../repositories/IInvitesRepository';

@injectable()
export default class CreateInviteService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async execute(email:string): Promise<Invite[]> {
    const invite = await this.invitesRepository.listInvitesByUser(email);
    invite.forEach((itens) => {
      // eslint-disable-next-line no-param-reassign
      itens.status = 0;
    });
    return invite;
  }
}
