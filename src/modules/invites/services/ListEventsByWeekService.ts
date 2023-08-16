import { inject, injectable } from 'tsyringe';

import { Invite } from '@prisma/client';

// import AppError from '@shared/errors/AppError';
import moment from 'moment';
import IInvitesRepository from '../repositories/IInvitesRepository';

@injectable()
export default class ListEventsService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async execute(phone:string): Promise<Invite[]> {
    const beginWeek = moment().startOf('week').format();
    const endWeek = moment().endOf('week').format();
    const invite = this.invitesRepository.listEventsInAWeekByUser(phone, beginWeek, endWeek);

    return invite;
  }
}
