import prisma from '@shared/infra/prisma/client';
import { Invite, Prisma } from '@prisma/client';

import IInvitesRepository from '@modules/invites/repositories/IInvitesRepository';
import ICreateInviteDTO from '@modules/invites/dtos/ICreateInviteDTO';
import { injectAll } from 'tsyringe';

export default class InvitesRepository implements IInvitesRepository {
  private ormRepository: Prisma.InviteDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

  constructor() {
    this.ormRepository = prisma.invite;
  }

  public async create(data: ICreateInviteDTO): Promise<Invite> {
    const invite = await this.ormRepository.create({ data });

    return invite;
  }

  public async listInvitesByUser(phone: string): Promise<Invite[]> {
    const invite = await this.ormRepository.findMany({ where: { phone, status: 0 } });

    return invite;
  }

  public async listEventsByUser(phone: string): Promise<Invite[]> {
    const invite = await this.ormRepository.findMany({ where: { phone, status: 1 } });

    return invite;
  }
}
