import { inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class ListUsersService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute(): Promise<User[]> {
    const users = this.usersRepository.listUsers();

    return users;
  }
}
