import { inject, injectable } from 'tsyringe';

import { PseudoUser } from '@prisma/client';

// import AppError from '@shared/errors/AppError';

import ICreatePseudoUserDTO from '../dtos/ICreatePseudoUserDTO';
import IPseudoUsersRepository from '../repositories/IPseudoUsersRepository';

@injectable()
export default class CreatePseudoUserService {
  constructor(
    @inject('InvitesRepository')
    private pseudoUserRepository: IPseudoUsersRepository,

  ) { }

  public async execute(data: ICreatePseudoUserDTO): Promise<PseudoUser> {
    if (data.email) {
      const pseudoUserByEmailAlreadyExists = await this.pseudoUserRepository.findByEmail(data.email);
      if (pseudoUserByEmailAlreadyExists) {
        throw new Error('PseudoUser already exists');
      }
    } else if (data.phone) {
      const pseudoUserByPhoneAlreadyExists = await this.pseudoUserRepository.findByPhone(data.phone);
      if (pseudoUserByPhoneAlreadyExists) {
        throw new Error('PseudoUser already exists');
      }
    }

    const pseudoUser = await this.pseudoUserRepository.create(data);

    return pseudoUser;
  }
}
