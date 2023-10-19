import { inject, injectable } from 'tsyringe';

import { User, Contato } from '@prisma/client';

// import AppError from '@shared/errors/AppError';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class ListContactsService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute(phone: string): Promise<(User & { contatos: Contato[] }) | null> {
    const user = await this.usersRepository.findByPhoneWithContacts(phone);
    if (!user || !user.contatos) throw new AppError('Either user was not found or he doesn`t have any contacts', 400);

    return user;
  }
}
