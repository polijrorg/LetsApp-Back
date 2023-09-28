import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import moment, { Moment } from 'moment-timezone';
import IUsersRepository from '../repositories/IUsersRepository';import googleGetRecommendedTimeService from './googleGetRecommendedTimeService';
import outlookGetRecommendedTimeService from './outlookGetRecommendedTimeService';

interface IFreeTime {
  date?: Moment|string |null;
  start1?: Moment|string|null;
  end1?: Moment|string|null;
}
interface IRequest{
  phone:string,
      beginDate:string,
      endDate:string,
      beginHour:string,
      endHour:string,
      duration:number,
      mandatoryGuests:string[],
      optionalGuests:string
}
@injectable()
export default class GetCalendarEvents {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate({
    beginDate, beginHour, duration, endDate, endHour, mandatoryGuests, phone,
  }:IRequest): Promise<IFreeTime[]> {
    const user = await this.usersRepository.findByPhone(phone);

    if (!user) throw new AppError('User not found', 400);

    const googleGetTime = container.resolve(googleGetRecommendedTimeService);
    const outlookGetTime = container.resolve(outlookGetRecommendedTimeService);

    mandatoryGuests.push(user.email!);

    const outlookUsers: string[] = [];
    const googleUsers: string[] = [];

    mandatoryGuests.forEach(async (element) => {
      if (await this.usersRepository.findTypeByEmail(element) === 'GOOGLE') {
        googleUsers.push(element);
      }
      if (await this.usersRepository.findTypeByEmail(element) === 'OUTLOOK') {
        outlookUsers.push(element);
      }
    });

    const googleRecommendedTimes = await googleGetTime.authenticate({
      beginDate, beginHour, duration, endDate, endHour, googleUsers, phone,
    });

    const outlookRecommendedTimes = await outlookGetTime.authenticate({
      beginDate, beginHour, duration, endDate, endHour, outlookUsers, phone,
    });
  }
}
