/* eslint-disable import/order */
import { container, inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';
import AppError from '@shared/errors/AppError';
import crypto from 'crypto';
import IUsersRepository from '../repositories/IUsersRepository';
import { SMSFallbackProvider } from '@shared/infra/http/middleware/fallbackSMSProvider';

@injectable()
export default class resendVerificationCodeService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('SMSFallbackProvider')  // ← ADICIONAR
    private smsProviderFallback: SMSFallbackProvider,
  ) { }

  public async execute(phone: string): Promise<User> {
    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    const code = crypto.randomInt(100000, 999999);

    const updatedUser = await this.usersRepository.updateCode(phone, code);

    // const sendSms = container.resolve(SMSFallbackProvider);
    const message = `Letsapp: Olá seu codigo é ${code}`;
    const status = await this.smsProviderFallback.sendSMS(phone, message);
    if (!status) throw new AppError('SMS not sent', 400);

    return updatedUser;
  }
}
