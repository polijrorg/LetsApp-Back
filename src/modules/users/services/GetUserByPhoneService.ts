import { inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class GetUserByPhone {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute(phone:string): Promise<User> {
    const user = await this.usersRepository.findContactsByPhone(phone);
    if (!user) {
      throw new AppError('User Not Found', 400);
    }
    return user;
  }
}
