import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { PseudoUser } from '@prisma/client';
import ICreatePseudoUserDTO from '../dtos/ICreatePseudoUserDTO';
import IPseudoUsersRepository from '../repositories/IPseudoUsersRepository';

@injectable()
export default class CreatePseudoUserService {
  constructor(
    @inject('PseudoUsersRepository')
    private pseudoUsersRepository: IPseudoUsersRepository,

  ) { }

  public async execute({ email, phone }: ICreatePseudoUserDTO): Promise<PseudoUser> {
    let pseudoUser: PseudoUser;

    if (email) {
      const pseudoUserAlreadyExistsByEmail = await this.pseudoUsersRepository.findByEmail(email);
      if (pseudoUserAlreadyExistsByEmail) {
        return pseudoUserAlreadyExistsByEmail;
      }

      pseudoUser = await this.pseudoUsersRepository.create({ email, phone: null });
      return pseudoUser;
    }

    if (!phone) throw new AppError('Phone must be provided');

    const pseudoUserAlreadyExistsByPhone = await this.pseudoUsersRepository.findByPhone(phone);
    if (pseudoUserAlreadyExistsByPhone) {
      return pseudoUserAlreadyExistsByPhone;
    }

    pseudoUser = await this.pseudoUsersRepository.create({ email: null, phone });
    return pseudoUser;
  }
}
