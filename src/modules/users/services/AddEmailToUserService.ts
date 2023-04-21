import { inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  id:string;
  email:string;

}

@injectable()
export default class AddEmailToUserServices {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute({ id, email }: IRequest): Promise<User> {
    // const userAlreadyExists = await this.usersRepository.findById(id);

    const user = this.usersRepository.updateEmail(id, email);

    return user;
  }
}
