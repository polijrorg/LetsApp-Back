import { inject, injectable } from 'tsyringe';

import { Invite } from '@prisma/client';

// import AppError from '@shared/errors/AppError';

import AppError from '@shared/errors/AppError';
import ICreateInviteDTO from '../dtos/ICreateInviteDTO';
import IInvitesRepository from '../repositories/IInvitesRepository';

@injectable()
export default class CreateInviteService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async execute({
    address, beginHour, date, description, endHour, guests, link, name, phone, status,
  }: ICreateInviteDTO): Promise<Invite> {
    if (date === '') throw new AppError('Phone is empty', 400);

    const invite = await this.invitesRepository.create({
      address, beginHour, date, description, endHour, guests, link, name, phone, status,
    });

    await this.invitesRepository.create({
      address, beginHour, date, description, endHour, guests, link, name, phone: guests, status: 0,
    });

    return invite;
  }
}
