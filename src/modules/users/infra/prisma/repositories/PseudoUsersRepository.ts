import ICreatePseudoUserDTO from '@modules/users/dtos/ICreatePseudoUserDTO';
import IPseudoUsersRepository from '@modules/users/repositories/IPseudoUsersRepository';
import { Prisma, PseudoUser } from '@prisma/client';
import prisma from '@shared/infra/prisma/client';
import { injectable } from 'tsyringe';

injectable();
export default class PseudoUsersRepository implements IPseudoUsersRepository {
    private ormPseudoUsersRepository: Prisma.PseudoUserDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

    private ormPseudoInvitesRepository: Prisma.PseudoInviteDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

    constructor() {
      this.ormPseudoUsersRepository = prisma.pseudoUser;
      this.ormPseudoInvitesRepository = prisma.pseudoInvite;
    }

    public async create(data: ICreatePseudoUserDTO): Promise<PseudoUser> {
      const pseudoUser = await this.ormPseudoUsersRepository.create({
        data,
      });

      return pseudoUser;
    }

    public async list(): Promise<PseudoUser[]> {
      const pseudoUsers = await this.ormPseudoUsersRepository.findMany();

      return pseudoUsers;
    }

    public async findByEmail(email: string): Promise<PseudoUser | null> {
      const pseudoUser = await this.ormPseudoUsersRepository.findUnique({
        where: {
          email,
        },
      });

      return pseudoUser;
    }

    public async findByPhone(phone: string): Promise<PseudoUser | null> {
      const pseudoUser = await this.ormPseudoUsersRepository.findUnique({
        where: {
          phone,
        },
      });

      return pseudoUser;
    }

    public async findById(id: string): Promise<PseudoUser | null> {
      const pseudoUser = await this.ormPseudoUsersRepository.findUnique({
        where: {
          id,
        },
      });

      return pseudoUser;
    }

    public async delete(id: string): Promise<void> {
      await this.ormPseudoUsersRepository.delete({
        where: {
          id,
        },
      });
    }

  // public async getInvites(pseudoUser: PseudoUser): Promise<PseudoInvite[]> {
  //   const pseudoInvites = await this.ormPseudoInvitesRepository.findMany({
  //     where: {
  //       connection: {
  //         id,
  //       },
  //       }
  //     },
  //   });

  //   return pseudoInvites;
  // }
}
