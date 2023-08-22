import { inject, injectable } from 'tsyringe';

import { Contato } from '@prisma/client';

import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class GetContactsByPhoneService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute(phone:string): Promise<Contato[]> {
    const contacts = await this.usersRepository.findContactsByPhone(phone);

    return contacts;
  }
}
