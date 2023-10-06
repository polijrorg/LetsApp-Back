import { container, inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

import AppError from '@shared/errors/AppError';

import IUsersRepository from '../repositories/IUsersRepository';
import SmsService from './SmsService';

@injectable()
export default class resendVerificationCodeService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute(phone: string): Promise<User> {
    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);
    if (!user.code) throw new AppError('Code not found', 400);

    const sendSms = container.resolve(SmsService);
    const message = `Letsapp: Olá seu codigo é ${user.code}`;
    const status = await sendSms.execute({ phone, message });
    if (status === 'Error') throw new AppError('SMS not sent', 400);

    return user;
  }
}
