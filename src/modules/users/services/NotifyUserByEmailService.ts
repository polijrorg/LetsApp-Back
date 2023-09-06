import { container, inject, injectable } from 'tsyringe';

// import AppError from '@shared/errors/AppError';
import path from 'path';
import AppError from '@shared/errors/AppError';
import IMailProvider from '@shared/container/providers/MailProvider/models/IMailProvider';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {

  email: string;
  name: string
}

@injectable()
export default class NotifyUserbyEmailService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('MailProvider')
    private mailProvider: IMailProvider,

  ) { }

  public async execute({ email, name }: IRequest): Promise<string> {
    if (email === '') throw new AppError('Email area is empty', 400);

    const templateDataFile = path.resolve(__dirname, '..', 'views', 'create_account.hbs');

    try {
      await this.mailProvider.sendMail({
        to: {
          name,
          email,
        },
        subject: 'Criação de conta',
        templateData: {
          file: templateDataFile,
          variables: { name },
        },
      });
    } catch (e) { throw new AppError('Email not sent', 400); }

    return 'Email sent';
  }
}
