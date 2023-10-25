import { inject, injectable, container } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IMailProvider from '@shared/container/providers/MailProvider/models/IMailProvider';
import IPseudoUsersRepository from '../repositories/IPseudoUsersRepository';

import NotifyUserBySmsService from './NotifyUserBySmsService';
import NotifyUserByEmailService from './NotifyUserByEmailService';

interface IRequest {
  pseudoUserId: string;
  link: string;
}

@injectable()
export default class SignUpLinkManagerService {
  constructor(
    @inject('PseudoUsersRepository')
    private usersPseudoUserRepository: IPseudoUsersRepository,
    @inject('MailProvider')
    private mailProvider: IMailProvider,

  ) { }

  public async execute({ link, pseudoUserId }: IRequest): Promise<string> {
    const pseudoUser = await this.usersPseudoUserRepository.findById(pseudoUserId);
    if (!pseudoUser) throw new AppError('PseudoUser not found', 400);

    if (pseudoUser.email) {
      const urlService = container.resolve(NotifyUserByEmailService);
      const response = await urlService.execute({ email: pseudoUser.email, link });
      return response;
    }

    if (!pseudoUser.phone) throw new AppError('PseudoUser has no email or phone', 400);

    const urlService = container.resolve(NotifyUserBySmsService);
    const response = await urlService.execute({ phone: pseudoUser.phone, link });

    return response;
  }
}
