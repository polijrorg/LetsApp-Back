import { container, inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

// import AppError from '@shared/errors/AppError';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';
import IPseudoUsersRepository from '../repositories/IPseudoUsersRepository';
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

  ) { }

  public async execute({ phone, pseudoUserId }: IRequest): Promise<User> {
    if (phone === '') throw new AppError('Phone is empty', 400);

    const oldUser = await this.usersRepository.findByPhone(phone);
    if (oldUser) { return oldUser; }

    let code = Math.floor(Math.random() * 999999);
    while (code < 100000) {
      code *= 10;
    }

    const message = `Letsapp: Olá seu codigo é ${code}`;
    const sendSms = container.resolve(SmsService);

    if (pseudoUserId) {
      const pseudoUser = await this.pseudoUsersRepository.findById(pseudoUserId);
      if (!pseudoUser) throw new AppError('PseudoUser not found', 400);

      if (pseudoUser.phone) {
        const status = await sendSms.execute({ phone, message });
        if (status === 'Error') throw new AppError('SMS not sent', 400);

        const user = this.usersRepository.create({ phone, code });
        // implementar logica de adicionar os invites ao usuario
        await this.pseudoUsersRepository.delete(pseudoUser.id);
        return user;
      } if (pseudoUser.email) {
        const user = await this.usersRepository.create({ phone, code });
        await this.usersRepository.updateEmail(user.id, pseudoUser.email);
        // implementar logica de adicionar os invites ao usuario
        await this.pseudoUsersRepository.delete(pseudoUser.id);
        return user;
      }
    }

    const user = this.usersRepository.create({ phone, code });

    return user;
  }
}
