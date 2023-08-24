import { inject, injectable } from 'tsyringe';

import { Contato, User } from '@prisma/client';

import AppError from '@shared/errors/AppError';
import axios from 'axios';
import IUsersRepository from '../repositories/IUsersRepository';
import UserController from '../infra/http/controller/UsersController';

interface IUsersVerified {user:User, calendar_found: boolean}
interface IResponse{user:User, contats:Contato[], res:string}
@injectable()
export default class GetUserByPhone {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute(phone:string): Promise<IUsersVerified> {
    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User Not Found', 400);
    try {
      const response = await axios.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${user.tokens}`);
      if (response.data.verified_email) {
        return { user, calendar_found: true };
      }

    // eslint-disable-next-line no-empty
    } catch (err) {}
    return { user, calendar_found: false };
  }
}
