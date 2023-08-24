import { inject, injectable } from 'tsyringe';

import { User } from '@prisma/client';

import AppError from '@shared/errors/AppError';
import axios from 'axios';
import IUsersRepository from '../repositories/IUsersRepository';

interface IUsersVerified {user:User, calendar_found: boolean}
@injectable()
export default class GetUserByEmailService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute(email:string): Promise<IUsersVerified> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new AppError('User Not Found', 400);
    try {
      const response = await axios.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${user.tokens}`);
      if (response.data.verified_email) {
        return { user, calendar_found: true };
      }

    // eslint-disable-next-line no-empty
    } catch (error) {}
    return { user, calendar_found: false };
  }
}
