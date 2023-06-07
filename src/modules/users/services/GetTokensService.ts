import { google } from 'googleapis';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class GetTokensService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async authenticate(code:string): Promise<void> {
    // const oauth2Client = new google.auth.OAuth2();

    const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.CLIENT_URI);
    const { tokens } = await oAuth2Client.getToken(code);

    const user = await this.usersRepository.findToken();
    if (!user) throw new AppError('User not found', 400);
    if (!tokens.access_token) throw new AppError('Token not found', 400);

    this.usersRepository.updateToken(user.id, tokens.access_token);
  }
}
