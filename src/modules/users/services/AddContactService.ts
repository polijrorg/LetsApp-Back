import { inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

// import AppError from '@shared/errors/AppError';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {

  userPhone:string,
  phone:string,
  name:string,
  email:string,
}

@injectable()
export default class AddContactService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute({
    userPhone, phone, name, email,
  }: IRequest): Promise<User> {
    let userId = null;
    const mainUser = await this.usersRepository.findByPhone(userPhone);
    if (!mainUser) throw new AppError('User Not Found', 400);
    const userC = await this.usersRepository.findByPhone(phone);

    if (userC) { userId = userC.id; }

    const data = {
      phone, name, email, userId,
    };
    const user = this.usersRepository.addContact(userPhone, data);

    return user;
  }
}
