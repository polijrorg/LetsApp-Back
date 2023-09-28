import prisma from '@shared/infra/prisma/client';
import { Invite, Prisma, User } from '@prisma/client';

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

  private ormRepository2: Prisma.UserDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

  constructor() {
    this.ormRepository = prisma.invite;
    this.ormRepository2 = prisma.user;
  }

  public async create(data: ICreateInviteDTO): Promise<Invite> {
    const UserEmail = await prisma.user.findUnique({ where: { phone: data.phone } });

    const a = {
      ...data,

      guests: {

        create:
        data.guests.map((guest) => ({
          Status: 'needsAction',
          optional: 0,
          User: { connect: { email: guest } },
        }
        )),

      },
    };

    const b = data.optionalGuests.map((guest) => ({
      Status: 'needsAction',
      optional: 1,
      User: { connect: { email: guest } },
    }
    ));

    a.guests.create.concat(b);

    a.guests.create.push({
      Status: 'accepted',
      optional: 0,
      User:
        { connect: { email: UserEmail!.email! } },
    });

    console.log(a.guests.create);

    // const invite = await this.ormRepository.create({ data: a });

    return a.guests.create;
  }

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

  public async UpdatedInviteById(eventId:string, begin:string, end:string, phone:string): Promise<Invite|null> {
    const inviteUser = await this.ormRepository.findFirst({
      where: {
        id: eventId,
      },

    });
    const invit = await this.ormRepository.update({
      where: {
        id: eventId,
      },
      data: { ...inviteUser, begin, end },

    });
    const user = await prisma.user.findUnique({ where: { phone } });

    await prisma.inviteUser.updateMany({ where: { idInvite: inviteUser?.id }, data: { Status: 'needsAction' } });
    await prisma.inviteUser.updateMany({ where: { idInvite: inviteUser?.id, userEmail: user!.email! }, data: { Status: 'accepted' } });

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

  public async findInviteById(id: string): Promise<Invite | null> {
    const invite = await this.ormRepository.findFirst({
      where: { id },
    });

    return invite;
  }

  public async findById(id: string): Promise<User | null> {
    const user = await this.ormRepository2.findFirst({
      where: { id },
    });

    return user;
  }
}
