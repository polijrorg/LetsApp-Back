import { inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  id:string;
  email:string;

}

@injectable()
export default class AddEmailToUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute({ id, email }: IRequest): Promise<User> {
    const userAlreadyExists = await this.usersRepository.findById(id);

    if (!userAlreadyExists) throw new AppError('User Not Found', 400);

    const user = this.usersRepository.updateEmail(id, email);

    return user;
  }
}
