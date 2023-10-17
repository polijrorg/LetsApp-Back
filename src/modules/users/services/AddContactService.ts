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
    const userId = null;
    const mainUser = await this.usersRepository.findByPhoneWithContacts(userPhone);
    if (!mainUser) throw new AppError('User Not Found', 400);

    // REVER
    console.log(email, phone);
    if (phone) { const isContactAlreadyAddedByPhone = await this.usersRepository.findContactByPhone(phone, mainUser.id); if (isContactAlreadyAddedByPhone) throw new AppError('Contact already added', 400); }
    if (email) { const isContactAlreadyAddedByEmail = await this.usersRepository.findContactByEmail(email, mainUser.id); if (isContactAlreadyAddedByEmail) throw new AppError('Contact already added', 400); }

    const data = {
      phone, name, email, userId,
    };
    const user = this.usersRepository.addContact(userPhone, data);

    return user;
  }
}
