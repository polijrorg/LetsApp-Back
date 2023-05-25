import { container, inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

// import AppError from '@shared/errors/AppError';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';
import SmsService from './SmsService';

interface IRequest {

  phone:string;
}

@injectable()
export default class CreateUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute({ phone }: IRequest): Promise<User> {
    if (phone === '') throw new AppError('Phone is empty', 400);
    // let code = Math.floor(Math.random() * 999999);
    // while (code < 100000) {
    //   code *= 10;
    // }
    // Para testes
    console.log(phone);
    const code = 111111;
    const message = `Letsapp: Olá seu codigo é ${code}`;
    const sendSms = await container.resolve(SmsService);
    const status = await sendSms.execute({ phone, message });
    if (status === 'Error') throw new AppError('SMS not sent', 400);

    const user = this.usersRepository.create({ phone, code });

    return user;
  }
}
