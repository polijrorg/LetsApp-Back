// src/modules/invites/services/GetRecommendedTimesService.ts
import { inject, injectable, container } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import moment from 'moment-timezone';
import IUsersRepository from '../repositories/IUsersRepository';
import googleGetRecommendedTimeService from './googleGetRecommendedTimeService';
import outlookGetRecommendedTimeService from './outlookGetRecommendedTimeService';
import UserManagementService from './UserManagementService';
import {
  classifyUsers,
  mergeBusyTimes,
  buildBusyIntervals,
  generateFreeTimes,
  validateTimeWindow,
} from '@shared/utils/date/calendarTimeUtils';

interface IFreeTime {
  date?: string | null;
  start?: string | null;
  end?: string | null;
}

interface IRequest {
  phone: string;
  beginDate: string;
  endDate: string;
  beginHour: string;
  endHour: string;
  duration: number;
  mandatoryGuests: string[];
  optionalGuests: string;
}

interface IMissingAuthentications {
  google: string[];
  outlook: string[];
}

@injectable()
export default class GetRecommendedTimesService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  public async authenticate({
    beginDate,
    beginHour,
    duration,
    endDate,
    endHour,
    mandatoryGuests,
    phone,
  }: IRequest): Promise<{ freeTimes: IFreeTime[]; missingAuthentications: IMissingAuthentications }> {
    moment.tz.setDefault('America/Sao_Paulo');
    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found', 400);

    mandatoryGuests.push(user.email!);
    const managementService = container.resolve(UserManagementService);
    const { guests } = await managementService.execute(mandatoryGuests, []);

    const { googleUsers, outlookUsers } = await classifyUsers(guests, this.usersRepository);

    const [googleResult, outlookResult] = await Promise.all([
      container.resolve(googleGetRecommendedTimeService).authenticate(googleUsers),
      container.resolve(outlookGetRecommendedTimeService).authenticate(outlookUsers),
    ]);

    const missingAuthentications: IMissingAuthentications = {
      google: googleResult.missingGoogleAuthentications,
      outlook: outlookResult.missingOutlookAuthentications,
    };

    const allBusyTimes = mergeBusyTimes(googleResult.horariosGoogle, outlookResult.horariosOutlook);
    const busyIntervals = buildBusyIntervals(allBusyTimes);
    const { isValid, beginMoment, endMoment } = validateTimeWindow(beginDate, beginHour, endDate, endHour);

    if (!isValid) return { freeTimes: [], missingAuthentications };

    const freeTimes = generateFreeTimes({
      busyIntervals,
      duration,
      beginMoment,
      endMoment,
      beginHour,
      endHour,
    });

    return { freeTimes, missingAuthentications };
  }
}
