import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import IUsersRepository from '../repositories/IUsersRepository';

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

    const emails = await this.usersRepository.listUserEmailByInvite(inviteId);
    console.log(emails);

    return emails;
  }
}
