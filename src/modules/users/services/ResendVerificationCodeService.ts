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

    let code = Math.floor(Math.random() * 999999);
    while (code < 100000) {
      code *= 10;
    }

    const updatedUser = await this.usersRepository.updateCode(phone, code);

    const sendSms = container.resolve(SmsService);
    const message = `Letsapp: Olá seu codigo é ${code}`;
    const status = await sendSms.execute({ phone, message });
    if (status === 'Error') throw new AppError('SMS not sent', 400);

    return updatedUser;
  }
}
