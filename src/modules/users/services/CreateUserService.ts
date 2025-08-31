/* eslint-disable import/order */
/* eslint-disable no-console */
import { container, inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

// import AppError from '@shared/errors/AppError';

import AppError from '@shared/errors/AppError';
import crypto from 'crypto';
import IUsersRepository from '../repositories/IUsersRepository';
import IPseudoUsersRepository from '../repositories/IPseudoUsersRepository';
import IInvitesRepository from '../../invites/repositories/IInvitesRepository';
// import SmsService from './SmsService';
import { SMSFallbackProvider } from '@shared/infra/http/middleware/fallbackSMSProvider';

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

    @inject('SMSFallbackProvider')  // ← ADICIONAR
    private smsProviderFallback: SMSFallbackProvider,

  ) { }

  public async execute({ phone, pseudoUserId }: IRequest): Promise<User> {
    if (phone === '') throw new AppError('Phone is empty', 400);

    const oldUser = await this.usersRepository.findByPhone(phone);
    console.log('CreateUserService 37: Old user found:', oldUser);
    // If user already exists, return the old user
    if (oldUser) {
      if (oldUser?.code == null) {
        throw new AppError('Existing user does not have a code', 400);
      }
      await this.sendSMS(phone, oldUser.code);
      console.log('CreateUserService 40: Returning existing user:', oldUser);
      // If the user already exists, we can return it directly
      // No need to generate a new code or send SMS again
      return oldUser;
    }

    const code = crypto.randomInt(100000, 999999);
    console.log('CreateUserService 42: Generated code:', code);
    if (pseudoUserId) {
      const pseudoUser = await this.pseudoUsersRepository.findById(pseudoUserId);
      if (!pseudoUser) throw new AppError('PseudoUser not found', 400);

      const user = await this.usersRepository.create({ phone, code });
      const pseudoUserInvite = await this.invitesRepository.findInviteByPseudoUser(pseudoUser);

      if (!pseudoUserInvite) throw new AppError('PseudoUserInvite not found', 400);
      await this.invitesRepository.connect(user, pseudoUserInvite);
      return user;
    }
    this.sendSMS(phone, code);
    const user = await this.usersRepository.create({ phone, code });
    console.log('CreateUserService 54: New user created:', user);
    return user;
  }

  // Método auxiliar para enviar SMS
  private async sendSMS(phone: string, code: number): Promise<boolean> {
    const message = `Letsapp: Olá seu codigo é ${code}`;
    // const sendSms = container.resolve(SMSFallbackProvider);
    const status = await this.smsProviderFallback.sendSMS(phone, message);
    console.log('SMS status:', status);
    if (!status) throw new AppError('SMS not sent', 400);
    return true;
  }
}
