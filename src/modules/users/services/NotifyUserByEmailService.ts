import { inject, injectable } from 'tsyringe';

// import AppError from '@shared/errors/AppError';
import AppError from '@shared/errors/AppError';
import IMailProvider from '@shared/container/providers/MailProvider/models/IMailProvider';
import HBS from 'handlebars';
import path from 'path';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  email: string;
  link: string;
}

@injectable()
export default class NotifyUserbyEmailService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('MailProvider')
    private mailProvider: IMailProvider,

  ) { }

  public async execute({ email, link }: IRequest): Promise<string> {
    if (email === '') throw new AppError('Email area is empty', 400);

    const data = {
      link,
    };

    const templateDataFile = path.resolve(__dirname, '..', 'views', 'create_account.hbs');
    const template = HBS.compile(templateDataFile);
    const html = template(data);

    try {
      await this.mailProvider.sendMail({
        to: {
          name: 'Convidado',
          email,
        },
        subject: 'Convite LetsApp',
        templateData: {
          file: html,
          variables: { link },
        },
      });
    } catch (e) { console.log(e.message); }

    return 'Email sent';
  }
}
