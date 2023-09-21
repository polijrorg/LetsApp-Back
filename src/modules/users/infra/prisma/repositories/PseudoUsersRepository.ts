import ICreatePseudoUserDTO from '@modules/users/dtos/ICreatePseudoUserDTO';
import IPseudoUsersRepository from '@modules/users/repositories/IPseudoUsersRepository';
import { PseudoUser, Prisma } from '@prisma/client';
import prisma from '@shared/infra/prisma/client';
import { injectable } from 'tsyringe';

injectable();
export default class PseudoUsersRepository implements IPseudoUsersRepository {
    private ormRepository: Prisma.PseudoUserDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

    constructor() {
      this.ormRepository = prisma.pseudoUser;
    }

    public async create(data: ICreatePseudoUserDTO): Promise<PseudoUser> {
      const pseudoUser = await this.ormRepository.create({
        data,
      });

      return pseudoUser;
    }

    public async list(): Promise<PseudoUser[]> {
      const pseudoUsers = await this.ormRepository.findMany();

      return pseudoUsers;
    }

    public async findByEmail(email: string): Promise<PseudoUser | null> {
      const pseudoUser = await this.ormRepository.findUnique({
        where: {
          email,
        },
      });

      return pseudoUser;
    }

    public async findByPhone(phone: string): Promise<PseudoUser | null> {
      const pseudoUser = await this.ormRepository.findUnique({
        where: {
          phone,
        },
      });

      return pseudoUser;
    }
}
