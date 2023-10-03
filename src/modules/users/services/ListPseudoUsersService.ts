import { inject, injectable } from 'tsyringe';

import { PseudoUser } from '@prisma/client';

import IPseudoUsersRepository from '../repositories/IPseudoUsersRepository';

@injectable()
export default class ListUsersService {
  constructor(
    @inject('PseudoUsersRepository')
    private pseudoUsersRepository: IPseudoUsersRepository,

  ) { }

  public async execute(): Promise<PseudoUser[]> {
    const pseudoUsers = this.pseudoUsersRepository.list();

    return pseudoUsers;
  }
}
