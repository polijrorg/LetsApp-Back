import AppError from '@shared/errors/AppError';
import moment, { Moment } from 'moment-timezone';
import { container, inject, injectable } from 'tsyringe';
import IUsersRepository from '../repositories/IUsersRepository';
import GetRecommendedTimeService from './GetRecommendedTimeService';

interface IRequest{
  inviteId:string,
  phone:string
}

interface IFreeTime {
  date?: Moment|string |null;
  start?: Moment|string|null;
  end?: Moment|string|null;
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

    const invite = await this.usersRepository.findInvite(inviteId);
    if (!invite) throw new AppError('Invite not found', 400);
    const usersEmails = await this.usersRepository.listUserEmailByInvite(inviteId);

    const possibleTimes = container.resolve(GetRecommendedTimeService);

    if (invite.beginSearch !== null && invite.endSearch !== null) {
      const times = await possibleTimes.authenticate(
        {
          phone,
          beginDate: `${invite.beginSearch.slice(0, 10)}T00:00:00-03:00`,
          endDate: `${invite.endSearch.slice(0, 10)}T00:00:00-03:00`,
          beginHour: invite.beginSearch.slice(11, 25),
          endHour: invite.endSearch.slice(11, 25),
          duration: moment(invite.end).diff(moment(invite.begin)) / 60000,
          mandatoryGuests: usersEmails,
          optionalGuests: 'undefined',
        },
      );

      return times;
    }
    const times = await possibleTimes.authenticate(
      {
        phone,
        beginDate: `${invite.begin.slice(0, 10)}T00:00:00-03:00`,
        endDate: `${invite.end.slice(0, 10)}T00:00:00-03:00`,
        beginHour: invite.begin.slice(11, 25),
        endHour: invite.end.slice(11, 25),
        duration: moment(invite.end).diff(moment(invite.begin)) / 60000,
        mandatoryGuests: usersEmails,
        optionalGuests: 'undefined',
      },
    );

    return times;
  }
}
