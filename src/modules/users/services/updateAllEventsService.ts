import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IInvitesRepository from '@modules/invites/repositories/IInvitesRepository';
import { Invite } from '@prisma/client';
import IUsersRepository from '../repositories/IUsersRepository';
import outlookUpdateEventService from './outlookUpdateEventService';
import googleUpdateEventService from './googleUpdateEventService';

interface IRequest {
  idInvite:string,
  phone:string,
  begin:string,
  end:string
}

@injectable()
export default class outlookUpdateEvent {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async authenticate({
    phone, idInvite, begin, end,
  }: IRequest): Promise<Invite | null> {
    const invite = await this.usersRepository.findInvite(idInvite);
    if (!invite) throw new AppError('Invite not found', 400);

    const user = await this.usersRepository.findByPhone(invite.phone);
    if (!user) throw new AppError('User not found', 400);

    const usersEmail = await this.usersRepository.listUserEmailByInvite(idInvite);

    const outlookUsers: string[] = [];
    const googleUsers: string[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const element of usersEmail) {
      // eslint-disable-next-line no-await-in-loop
      const userType = await this.usersRepository.findTypeByEmail(element);

      if (userType === 'GOOGLE') {
        googleUsers.push(element);
      } else if (userType === 'OUTLOOK') {
        outlookUsers.push(element);
      }
    }

    const updateOutlookEvent = container.resolve(outlookUpdateEventService);
    const updateGoogleEvent = container.resolve(googleUpdateEventService);

    if (outlookUsers !== null) {
      for (let i = 0; i < outlookUsers.length; i += 1) {
        const email = outlookUsers[i];
        // eslint-disable-next-line no-await-in-loop
        await updateOutlookEvent.authenticate({
          email, idInvite, begin, end,
        });
      }
    }

    if (googleUsers !== null) {
      const eventId = idInvite;
      for (let i = 0; i < googleUsers.length; i += 1) {
        const email = googleUsers[i];
        // eslint-disable-next-line no-await-in-loop
        await updateGoogleEvent.authenticate({
          email, eventId, begin, end,
        });
      }
    }

    if (outlookUsers === null && googleUsers === null) throw new AppError('Users not found', 400);

    const updatedInvite = await this.invitesRepository.UpdatedInviteById(
      invite.id,
      begin,
      end,
      phone,
    );

    return updatedInvite;
  }
}
