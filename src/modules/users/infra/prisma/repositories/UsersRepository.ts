import prisma from '@shared/infra/prisma/client';
import { Prisma, User } from '@prisma/client';

import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import ICreateUserDTO from '@modules/users/dtos/ICreateUserDTO';
// import IUpdateUserDTO from '@modules/users/dtos/IUpdateUserDTO';
interface IUpload{
  name:string,
  photo:string
}
export default class UsersRepository implements IUsersRepository {
  private ormRepository: Prisma.UserDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

  constructor() {
    this.ormRepository = prisma.user;
  }

  public async findByEmailWithRelations(email: string): Promise<User | null> {
    const user = await this.ormRepository.findFirst({
      where: { email },
    });

    return user;
  }

  public async findByPhone(phone: string): Promise<User | null> {
    const user = await this.ormRepository.findFirst({
      where: { phone },
    });

    return user;
  }

  public async findById(id: string): Promise<User | null> {
    const user = await this.ormRepository.findFirst({
      where: { id },
    });

    return user;
  }

  public async updatePhotoAndName(id: string, data: IUpload): Promise<User> {
    const user = await this.ormRepository.update({ where: { id }, data });

    return user;
  }

  public async updateEmail(id: string, data: string): Promise<User> {
    const user = await this.ormRepository.update({ where: { id }, data });

    return user;
  }

  public async create(data: ICreateUserDTO): Promise<User> {
    const user = await this.ormRepository.create({ data });

    return user;
  }
}
