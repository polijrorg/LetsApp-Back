import { inject, injectable } from 'tsyringe';

// import AppError from '@shared/errors/AppError';
import AppError from '@shared/errors/AppError';
import IMailProvider from '@shared/container/providers/MailProvider/models/IMailProvider';
import HBS from 'handlebars';
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

    const templateDataFile = HBS.template(`
      <style>
        .message-content {
          font-family: Arial, Helvetica, sans-serif;
          max-width: : 600px;
          font-size: 18px;
          line-height: 21px;
        }
      </style>
  
      <div class="message-content"> 
        <p>'Você foi convidado para um evento LetsApp. Cadastre-se acessando: ${link}'</p>
      </div>
    `).toString();

    try {
      await this.mailProvider.sendMail({
        to: {
          name: 'Convidado',
          email,
        },
        subject: 'Convite LetsApp',
        templateData: {
          file: templateDataFile,
          variables: { link },
        },
      });
    } catch (e) { throw new AppError('Email not sent', 400); }

    return 'Email sent';
  }
}
