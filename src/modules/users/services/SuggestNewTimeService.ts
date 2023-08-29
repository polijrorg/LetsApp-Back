import AppError from '@shared/errors/AppError';
import moment from 'moment';
import { container, inject, injectable } from 'tsyringe';
import IUsersRepository from '../repositories/IUsersRepository';
import GetRecommendedTimeService from './GetRecommendedTimeService';

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
  }:IRequest): Promise<string[]> {
    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    const invite = await this.usersRepository.findInvite(inviteId);
    if (!invite) throw new AppError('Invite not found', 400);
    const time = container.resolve(GetRecommendedTimeService);
    const usersEmails = await this.usersRepository.listUserEmailByInvite(inviteId);
    console.log(usersEmails);

    const times = await time.authenticate(
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
