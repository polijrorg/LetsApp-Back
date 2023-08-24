import { calendar_v3 } from 'googleapis';
import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import moment, { Moment } from 'moment-timezone';
import InvitesRepository from '@modules/invites/infra/prisma/repositories/InvitesRepository';
import { prisma } from '@prisma/client';
import IUsersRepository from '../repositories/IUsersRepository';
import GetCalendarEventsService from './GetCalendarEventsService';

interface IFreeTime {
  date?: Moment|string |null;
  start1?: Moment|string|null;
  end1?: Moment|string|null;
}
interface IRequest{
  inviteId:string,
  phone:string
}
@injectable()
export default class SuggestNewTimeService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    inviteId, phone,
  }:IRequest): Promise<IFreeTime[]> {
    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    const emails = await this.usersRepository.listUserEmailByInvite(inviteId);
    console.log(emails);

    return emails;
  }
}
