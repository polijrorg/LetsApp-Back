import { container, inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

// import AppError from '@shared/errors/AppError';

import AppError from '@shared/errors/AppError';
import crypto from 'crypto';
import IUsersRepository from '../repositories/IUsersRepository';
import IPseudoUsersRepository from '../repositories/IPseudoUsersRepository';
import IInvitesRepository from '../../invites/repositories/IInvitesRepository';
import SmsService from './SmsService';

interface IRequest {
  pseudoUserId?: string;
  phone:string;
}

@injectable()
export default class CreateUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('PseudoUsersRepository')
    private pseudoUsersRepository: IPseudoUsersRepository,

    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async execute({ phone, pseudoUserId }: IRequest): Promise<User> {
    if (phone === '') throw new AppError('Phone is empty', 400);

    const oldUser = await this.usersRepository.findByPhone(phone);
    if (oldUser) { return oldUser; }

    const code = crypto.randomInt(100000, 999999);

    if (pseudoUserId) {
      const pseudoUser = await this.pseudoUsersRepository.findById(pseudoUserId);
      if (!pseudoUser) throw new AppError('PseudoUser not found', 400);

      const user = await this.usersRepository.create({ phone, code });
      const pseudoUserInvite = await this.invitesRepository.findInviteByPseudoUser(pseudoUser);

      if (!pseudoUserInvite) throw new AppError('PseudoUserInvite not found', 400);
      await this.invitesRepository.connect(user, pseudoUserInvite);
      return user;
    }

    const message = `Letsapp: Olá seu codigo é ${code}`;
    const sendSms = container.resolve(SmsService);
    const status = await sendSms.execute({ phone, message });
    if (status === 'Error') throw new AppError('SMS not sent', 400);

    const user = this.usersRepository.create({ phone, code });

    return user;
  }
}
