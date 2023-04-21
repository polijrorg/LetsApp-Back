import { inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

import AppError from '@shared/errors/AppError';

import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  name: string;
  phone:string;
  photoFile: Express.Multer.File;
}

@injectable()
export default class CreateUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) {}

  public async execute({
    name,
    phone,
    photoFile,
  }: IRequest): Promise<User> {
    const userAlreadyExists = await this.usersRepository.findByPhone(
      phone,
    );
    if (!userAlreadyExists) throw new AppError('User with same email already exists', 400);

    if (!photoFile) throw new AppError('You cannot create a user without a photo.');

    const photo = photoFile.location;
    const user = this.usersRepository.update(userAlreadyExists?.id, {
      name,
      photo,
    });

    return user;
  }
}
