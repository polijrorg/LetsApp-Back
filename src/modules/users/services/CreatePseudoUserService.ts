import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
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

  public async execute({ email, phone }: ICreatePseudoUserDTO): Promise<PseudoUser> {
    if (email) {
      const pseudoUserAlreadyExistsByEmail = await this.pseudoUserRepository.findByEmail(email);
      if (pseudoUserAlreadyExistsByEmail) {
        throw new AppError('PseudoUser already exists');
      }
    } else if (phone) {
      const pseudoUserAlreadyExistsByPhone = await this.pseudoUserRepository.findByPhone(phone);
      if (pseudoUserAlreadyExistsByPhone) {
        throw new AppError('PseudoUser already exists');
      }
    }

    const pseudoUser = await this.pseudoUserRepository.create({ email, phone });

    return pseudoUser;
  }
}
