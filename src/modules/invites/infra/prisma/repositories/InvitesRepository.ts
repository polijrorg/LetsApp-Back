import prisma from '@shared/infra/prisma/client';
import { v4 as uuid } from 'uuid';
import {
  Invite, InviteUser, Prisma, User, PseudoUser, PseudoInviteUser,
} from '@prisma/client';

import IInvitesRepository from '@modules/invites/repositories/IInvitesRepository';
import ICreateInviteDTO from '@modules/invites/dtos/ICreateInviteDTO';

interface IInviteWithConfirmation {
  element: Invite; // Replace 'YourElementType' with the actual type of 'element'
  yes: { amount: number, ateendees: User[], pseudoAttendes: PseudoUser[] };
  no: { amount: number, ateendees: User[], pseudoAttendes: PseudoUser[] };
  maybe: { amount: number, ateendees: User[], pseudoAttendes: PseudoUser[] };
}
export default class InvitesRepository implements IInvitesRepository {
  private ormRepository: Prisma.InviteDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

  private ormRepository2: Prisma.UserDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

  private ormRepository3: Prisma.InviteUserDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

  private ormRepository4: Prisma.PseudoInviteUserDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

  constructor() {
    this.ormRepository = prisma.invite;
    this.ormRepository2 = prisma.user;
    this.ormRepository3 = prisma.inviteUser;
    this.ormRepository4 = prisma.pseudoInviteUser;
  }

  public async create({
    name, begin, end, beginSearch, endSearch, phone, guests, optionalGuests, pseudoGuests, pseudoOptionalGuests, description, address, state, googleId, organizerName, organizerPhoto, link,
  }: ICreateInviteDTO): Promise<Invite> {
    const user = await prisma.user.findUnique({ where: { phone } });
    const createData = {
      name,
      begin,
      end,
      beginSearch,
      endSearch,
      phone,
      description,
      guests: {
        create:
          guests.map((guest) => ({
            Status: 'needsAction',
            optional: false,
            User: { connect: { email: guest } },
          })),
      },
      pseudoGuests: {
        create:
          pseudoGuests.map((pseudoGuest) => ({
            Status: 'pseudoUser',
            optional: false,
            pseudoUser: { connect: { id: pseudoGuest } },
          })),

      },
      address,
      link,
      state,
      googleId,
      organizerPhoto,
      organizerName,
    };

    createData.guests.create.concat(optionalGuests.map((guest) => ({
      Status: 'needsAction',
      optional: true,
      User: { connect: { email: guest } },
    }
    )));

    createData.pseudoGuests.create.concat(pseudoOptionalGuests.map((guest) => ({
      Status: 'pseudoUser',
      optional: true,
      pseudoUser: { connect: { id: guest } },
    })));

    createData.guests.create.push({ Status: 'accepted', optional: false, User: { connect: { email: user!.email! } } });
    const invite = await this.ormRepository.create({ data: createData, include: { pseudoGuests: true } });

    return invite;
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

    const inviteIds = invites.map((invite) => invite.inviteId);

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
          inviteId: element.id,
        },
      });

      const no = await prisma.inviteUser.count({
        where: {
          Status: 'declined',
          inviteId: element.id,
        },
      });

      const maybe = await prisma.inviteUser.count({
        where: {
          Status: 'needsAction',
          inviteId: element.id,
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

  public async listEventsByUser(email: string): Promise<IInviteWithConfirmation[]> {
    const invites = await prisma.inviteUser.findMany({
      where: {
        userEmail: email,
        Status: 'accepted',
      },

    });

    const inviteIds = invites.map((invite) => invite.inviteId);

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
      const maybeAteendeesPseudo1: PseudoUser[] = [];
      const yesAmount = await prisma.inviteUser.count({
        where: {
          Status: 'accepted',
          inviteId: element.id,
        },
      });

      const yesAttendees = await prisma.inviteUser.findMany({
        where: {
          Status: 'accepted',
          inviteId: element.id,
        },
      });
      const yesAteendees1: User[] = [];
      yesAttendees.map(async (ateendee) => {
        const y = await this.ormRepository2.findUnique({
          where: {
            email: ateendee.userEmail,
          },
        });
        yesAteendees1.push(y!);
      });

      const noAmount = await prisma.inviteUser.count({
        where: {
          Status: 'declined',
          inviteId: element.id,
        },
      });

      const noAttendees = await prisma.inviteUser.findMany({
        where: {
          Status: 'declined',
          inviteId: element.id,
        },
      });
      const noAteendees1: User[] = [];
      noAttendees.map(async (ateendee) => {
        const n = await this.ormRepository2.findUnique({
          where: {
            email: ateendee.userEmail,
          },
        });
        noAteendees1.push(n!);
      });

      const maybeAmount = await prisma.inviteUser.count({
        where: {
          Status: 'needsAction',
          inviteId: element.id,
        },
      });
      const maybeAteendees1: User[] = [];

      const maybeAttendeesPseudo = await prisma.pseudoInviteUser.findMany({
        where: {
          inviteId: element.id,
        },
      });

      await Promise.all(
        maybeAttendeesPseudo.map(async (ateendee) => {
          const n = await prisma.pseudoUser.findUnique({
            where: {
              id: ateendee.pseudoUserId,
            },
          });
          maybeAteendeesPseudo1.push(n!);
        }),
      );

      const maybeAttendees = await prisma.inviteUser.findMany({
        where: {
          Status: 'needsAction',
          inviteId: element.id,
        },
      });

      maybeAttendees.map(async (ateendee) => {
        const m = await this.ormRepository2.findUnique({
          where: {
            email: ateendee.userEmail,
          },
        });
        maybeAteendees1.push(m!);
      });

      const maybePsc = (maybeAmount + maybeAteendeesPseudo1.length);
      const temp: IInviteWithConfirmation = {
        element,
        yes: { amount: yesAmount, ateendees: yesAteendees1, pseudoAttendes: [] },
        no: { amount: noAmount, ateendees: noAteendees1, pseudoAttendes: [] },
        maybe: { amount: maybePsc, ateendees: maybeAteendees1, pseudoAttendes: maybeAteendeesPseudo1 },
      };

      invitedWithConfirmation.push(temp);
    }));

    return invitedWithConfirmation;
  }

  public async UpdatedInviteStatusById(id: string, state: string, email: string): Promise<Invite | null> {
    const invit = await this.ormRepository.update({
      where: {
        id,
      },
      data: { state },
    });

    const inviteUser = await prisma.inviteUser.findFirst({
      where: {
        userEmail: email,
        inviteId: id,
      },

    });

    await prisma.inviteUser.update({ where: { id: inviteUser?.id }, data: { Status: state } });

    return invit;
  }

  public async UpdatedInviteById(eventId: string, begin: string, end: string, phone: string): Promise<Invite | null> {
    const inviteUser = await this.ormRepository.findFirst({
      where: {
        id: eventId,
      },

    });
    const invit = await this.ormRepository.update({
      where: {
        id: eventId,
      },
      data: {
        ...inviteUser, begin, end, phone,
      },

    });
    const user = await prisma.user.findUnique({ where: { phone } });

    await prisma.inviteUser.updateMany({ where: { inviteId: inviteUser?.id }, data: { Status: 'needsAction' } });
    await prisma.inviteUser.updateMany({ where: { inviteId: inviteUser?.id, userEmail: user!.email! }, data: { Status: 'accepted' } });

    return invit;
  }

  public async listEventsInAWeekByUser(phone: string, beginWeek: string, endWeek: string): Promise<Invite[]> {
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

  public async findByEmail(email: string): Promise<User | null> {
    const user = await this.ormRepository2.findFirst({
      where: { email },
    });

    return user;
  }

  public async findEventByInvite(user: User, invite: Invite): Promise<InviteUser | null> {
    const userInvite = await this.ormRepository3.findFirst({
      where: { User: user, Invite: invite },
    });

    return userInvite;
  }

  public async findInviteByPseudoUser(pseudoUser: PseudoUser): Promise<Invite | null> {
    const pseudoUserInvite = await this.ormRepository4.findFirst({
      where: { pseudoUser },
    });

    const invite = await this.ormRepository.findFirst({
      where: { id: pseudoUserInvite?.inviteId },
    });

    return invite;
  }

  public async connect(user: User, invite: Invite): Promise<InviteUser> {
    const id = uuid();

    const updatedUser = await this.ormRepository2.update({
      where: { id: user.id },
      data: {
        email: id.concat('@transitionEmail'),
      },
    });

    const userInvite = await this.ormRepository3.create({
      data: {
        // if doenst work, try to change to user.id to user.email
        User: { connect: { email: updatedUser.email! } },
        Invite: { connect: { id: invite.id } },
        optional: false,
        Status: 'needsAction',
      },
    });

    return userInvite;
  }

  public async findInvitesByOrganizerName(organizerName: string): Promise<(Invite & { pseudoGuests: PseudoInviteUser[] })[] | null> {
    const invites = await this.ormRepository.findMany({
      where: { organizerName },
      include: { pseudoGuests: true },
    });

    return invites;
  }

  public async delete(id: string): Promise<Invite | null> {
    const invite = await this.ormRepository.delete({
      where: { id },
    });

    return invite;
  }
  private async filterNewInvites(invites: ICreateInviteDTO[]): Promise<ICreateInviteDTO[]> {
    const validInvites = invites.filter((i) => i && typeof i.googleId === 'string' && i.googleId.trim() !== '');

    const googleIds = invites
      .map((i) => i?.googleId)
      .filter((id): id is string => !!id);

    const createdInvites = await this.ormRepository.findMany({
      where: {
        googleId: { in: googleIds },
      },
    });

    if (validInvites.length < invites.length) {
      console.warn(
        '⚠️ Alguns invites estavam inválidos e foram ignorados:',
        invites.filter(i => !i || !i.googleId)
      );
    }
    const existingIds = new Set(createdInvites.map(i => i.googleId));
    return validInvites.filter(i => !existingIds.has(i.googleId));
  }

  private async createInvitesWithoutRelations(invites: ICreateInviteDTO[]): Promise<Invite[]> {
    const baseData = invites.map((invite) => ({
      name: invite.name,
      begin: invite.begin,
      end: invite.end,
      beginSearch: invite.beginSearch,
      endSearch: invite.endSearch,
      phone: invite.phone,
      description: invite.description,
      address: invite.address,
      link: invite.link,
      state: invite.state,
      googleId: invite.googleId,
      organizerPhoto: invite.organizerPhoto,
      organizerName: invite.organizerName,
    }));

    await this.ormRepository.createMany({ data: baseData });

    return this.ormRepository.findMany({
      where: {
        googleId: { in: invites.map((i) => i.googleId) },
      },
    });
  }
  private async prepareRelations(invites: ICreateInviteDTO[], createdInvites: Invite[]) {
    const inviteUserData: Prisma.InviteUserCreateManyInput[] = [];
    const pseudoInviteUserData: Prisma.PseudoInviteUserCreateManyInput[] = [];

    for (const invite of invites) {
      const created = createdInvites.find(i => i.googleId === invite.googleId);
      if (!created) continue;

      invite.guests.forEach(email => {
        inviteUserData.push({
          inviteId: created.id,
          userEmail: email,
          optional: false,
          Status: 'needsAction',
        });
      });

      invite.optionalGuests.forEach(email => {
        inviteUserData.push({
          inviteId: created.id,
          userEmail: email,
          optional: true,
          Status: 'needsAction',
        });
      });

      invite.pseudoGuests.forEach(id => {
        pseudoInviteUserData.push({
          inviteId: created.id,
          pseudoUserId: id,
          optional: false,
          Status: 'pseudoUser',
        });
      });

      invite.pseudoOptionalGuests.forEach(id => {
        pseudoInviteUserData.push({
          inviteId: created.id,
          pseudoUserId: id,
          optional: true,
          Status: 'pseudoUser',
        });
      });

      const organizer = await this.ormRepository2.findUnique({ where: { phone: invite.phone } });
      if (organizer?.email) {
        inviteUserData.push({
          inviteId: created.id,
          userEmail: organizer.email,
          optional: false,
          Status: 'accepted',
        });
      }
    }

    return { inviteUserData, pseudoInviteUserData };
  }
  private async createRelations(
    inviteUserData: Prisma.InviteUserCreateManyInput[],
    pseudoInviteUserData: Prisma.PseudoInviteUserCreateManyInput[]
  ) {
    if (inviteUserData.length) {
      await this.ormRepository3.createMany({ data: inviteUserData, skipDuplicates: true });
    }

    if (pseudoInviteUserData.length) {
      await this.ormRepository4.createMany({ data: pseudoInviteUserData, skipDuplicates: true });
    }
  }
  public async createMany(invites: ICreateInviteDTO[]): Promise<Invite[]> {
    const newInvites = await this.filterNewInvites(invites);
    if (!newInvites.length) return [];

    const createdInvites = await this.createInvitesWithoutRelations(newInvites);
    const { inviteUserData, pseudoInviteUserData } = await this.prepareRelations(newInvites, createdInvites);
    await this.createRelations(inviteUserData, pseudoInviteUserData);

    return createdInvites;
  }

}
