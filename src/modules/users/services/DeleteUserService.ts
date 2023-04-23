import { inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

// import AppError from '@shared/errors/AppError';

import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  phone:string;
}

@injectable()
export default class DeleteUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute({ phone }: IRequest): Promise<User> {
    const user = this.usersRepository.delete(phone);

    return user;
  }
}
