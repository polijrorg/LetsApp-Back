import { inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

import AppError from '@shared/errors/AppError';

import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  name: string;
  phone: string;
  photoFile: Express.Multer.File | null;
  hasPhoto: boolean;
}

@injectable()
export default class UploadUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  public async execute({
    name,
    phone,
    photoFile,
    hasPhoto,
  }: IRequest): Promise<User> {
    const userFound = await this.usersRepository.findByPhone(phone);
    if (!userFound) throw new AppError('User not found', 400);

    let photo = '';
    if (photoFile) {
      photo = photoFile.location;
    }

    let user: User;

    if (hasPhoto) {
      user = await this.usersRepository.updatePhotoAndName(userFound?.id, {
        name,
        photo,
      });
    } else {
      user = await this.usersRepository.updateName(userFound?.id, name);
    }

    return user;
  }
}
