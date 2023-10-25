import { container, inject, injectable } from 'tsyringe';

// import AppError from '@shared/errors/AppError';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';
import SmsService from './SmsService';

interface IRequest {
  phone:string;
  link: string;
}

@injectable()
export default class NotifyUserbySmsService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute({ phone, link }: IRequest): Promise<string> {
    const message = `Cadastre-se no Letsapp ${link}`;
    const sendSms = container.resolve(SmsService);
    const status = await sendSms.execute({ phone, message });
    if (status === 'Error') throw new AppError('SMS not sent', 400);

    return 'SMS sent';
  }
}
