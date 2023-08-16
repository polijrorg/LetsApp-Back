import prisma from '@shared/infra/prisma/client';
import { Invite, Prisma } from '@prisma/client';

import IInvitesRepository from '@modules/invites/repositories/IInvitesRepository';
import ICreateInviteDTO from '@modules/invites/dtos/ICreateInviteDTO';

export default class InvitesRepository implements IInvitesRepository {
  private ormRepository: Prisma.InviteDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

  constructor() {
    this.ormRepository = prisma.invite;
  }

  public async create(data: ICreateInviteDTO): Promise<Invite> {
    const UserEmail = await prisma.user.findUnique({ where: { phone: data.phone } });
    const a = {
      ...data,

      guests: {

        create:
        data.guests.map((guest) => ({
          Status: 0,
          User: { connect: { email: guest } },
        })),

      },
    };

    a.guests.create.push({ Status: 1, User: { connect: { email: UserEmail!.email! } } });
    const invite = await this.ormRepository.create({ data: a });

    return invite;
  }

  // public async updateCreatorStatus(data: ICreateInviteDTO): Promise<Invite> {
  //   const a = {
  //     ...data,

  //     guests: {
  //       create: data.guests.map((guest) => ({
  //         User: { connect: { email: guest } },
  //       })),

  //     },
  //   };
  //   console.log(a.guests);
  //   const invite = await this.ormRepository.create({ data: a });

  //   return a;
  // }

  public async listInvitesByUser(email: string): Promise<Invite[]> {
    const invites = await prisma.inviteUser.findMany({
      where: {
        userEmail: email,
        Status: 0,
      },
      select: {
        idInvite: true,
      },
    });

    const inviteIds = invites.map((invite) => invite.idInvite);

    const invited = await this.ormRepository.findMany({
      where: {
        id: { in: inviteIds },
      },
      orderBy: {
        begin: 'asc',

      },
    });

    return invited;
  }

  public async listEventsByUser(email: string): Promise<Invite[]> {
    const invites = await prisma.inviteUser.findMany({
      where: {
        userEmail: email,
        Status: 1,
      },
      select: {
        idInvite: true,
      },
    });

    const inviteIds = invites.map((invite) => invite.idInvite);

    const invited = await this.ormRepository.findMany({
      where: {
        id: { in: inviteIds },
      },
      orderBy: {
        begin: 'asc',

      },
    });

    return invited;
  }

  public async UpdatedInviteStatusById(id: string, status:number, email:string): Promise<Invite|null> {
    const invit = await this.ormRepository.update({
      where: {
        id,
      },
      data: { status },
    });

    const inviteUser = await prisma.inviteUser.findFirst({
      where: {
        userEmail: email,
        idInvite: id,
      },

    });
    await prisma.inviteUser.update({ where: { id: inviteUser?.id }, data: { Status: status } });

    return invit;
  }

  public async listEventsInAWeekByUser(phone: string, beginWeek:string, endWeek:string): Promise<Invite[]> {
    const events = await this.ormRepository.findMany({
      where: {
        phone, status: 1, begin: { gte: beginWeek }, end: { lte: endWeek },
      },
      orderBy: {
        begin: 'asc',

      },
    });

    return events;
  }
}
