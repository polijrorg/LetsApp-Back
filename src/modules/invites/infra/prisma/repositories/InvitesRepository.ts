import prisma from '@shared/infra/prisma/client';
import { Invite, Prisma } from '@prisma/client';

import IInvitesRepository from '@modules/invites/repositories/IInvitesRepository';
import ICreateInviteDTO from '@modules/invites/dtos/ICreateInviteDTO';

interface IInviteWithConfirmation {
  element: Invite; // Replace 'YourElementType' with the actual type of 'element'
  yes: number;
  no: number;
  maybe: number;
}
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
          Status: 'needsAction',
          User: { connect: { email: guest } },
        })),

      },
    };

    a.guests.create.push({ Status: 'accepted', User: { connect: { email: UserEmail!.email! } } });
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

  public async listInvitesByUser(email: string): Promise<IInviteWithConfirmation[]> {
    const invites = await prisma.inviteUser.findMany({
      where: {
        OR: [
          {
            userEmail: email,
            Status: 'needsAction',
          },
          {
            userEmail: email,
            Status: 'declined',
          },
        ],
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

    const invitedWithConfirmation: IInviteWithConfirmation[] = [];

    await Promise.all(invited.map(async (element) => {
      const yes = await prisma.inviteUser.count({
        where: {
          Status: 'accepted',
          idInvite: element.id,
        },
      });

      const no = await prisma.inviteUser.count({
        where: {
          Status: 'declined',
          idInvite: element.id,
        },
      });

      const maybe = await prisma.inviteUser.count({
        where: {
          Status: 'needsAction',
          idInvite: element.id,
        },
      });

      const temp: IInviteWithConfirmation = {
        element,
        yes,
        no,
        maybe,
      };

      invitedWithConfirmation.push(temp);
    }));

    return invitedWithConfirmation;
  }

  public async listEventsByUser(email: string): Promise<Invite[]> {
    const invites = await prisma.inviteUser.findMany({
      where: {
        userEmail: email,
        Status: 'accepted',
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

  public async UpdatedInviteStatusById(id: string, state:string, email:string): Promise<Invite|null> {
    const invit = await this.ormRepository.update({
      where: {
        id,
      },
      data: { state },
    });

    const inviteUser = await prisma.inviteUser.findFirst({
      where: {
        userEmail: email,
        idInvite: id,
      },

    });

    await prisma.inviteUser.update({ where: { id: inviteUser?.id }, data: { Status: state } });

    return invit;
  }

  public async listEventsInAWeekByUser(phone: string, beginWeek:string, endWeek:string): Promise<Invite[]> {
    const events = await this.ormRepository.findMany({
      where: {
        phone, state: 'accepted', begin: { gte: beginWeek }, end: { lte: endWeek },
      },
      orderBy: {
        begin: 'asc',

      },
    });

    return events;
  }
}
