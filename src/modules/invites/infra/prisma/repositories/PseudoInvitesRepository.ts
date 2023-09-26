import { Prisma, PseudoInvite } from '@prisma/client';
import prisma from '@shared/infra/prisma/client';
import IPseudoInvitesRepository from '@modules/invites/repositories/IPseudoInvitesRepository';
import ICreatePseudoInviteDTO from '@modules/invites/dtos/ICreatePseudoInviteDTO';

export default class PseudoInvitesRepository implements IPseudoInvitesRepository {
  private ormRepository: Prisma.PseudoInviteDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

  constructor() {
    this.ormRepository = prisma.pseudoInvite;
  }

  public async create(data: ICreatePseudoInviteDTO): Promise<PseudoInvite> {
    const createData = {
      guests: {
        create:
        data.guests.map((guest) => ({
          PseudoUser: {
            connect: {
              id: guest,
            },
          },
        })),
      },
    };

    createData.guests.create.concat(data.optionalGuests.map((optionalGuest) => ({
      PseudoUser: {
        connect: {
          id: optionalGuest,
        },
      },
    })));

    const pseudoInvite = await this.ormRepository.create({
      data: createData,
    });

    return pseudoInvite;
  }
}
