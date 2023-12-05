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

  public async authenticate(code: string, state: string): Promise<boolean> {
    const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CLIENT_URI);
    const { tokens } = await oAuth2Client.getToken(code);

    oAuth2Client.setCredentials(tokens);

    const userInfo = await google.oauth2('v2').userinfo.get({ auth: oAuth2Client });
    if (!userInfo.data.email) {
      throw new AppError('Email not found in user info', 400);
    }

    try {
      const user = await this.usersRepository.findByPhone(state);
      if (!user) throw new AppError('User Not Found', 400);
      await this.usersRepository.updateEmail(user?.id, userInfo.data.email);

      if (!tokens.access_token) throw new AppError('Token not found', 400);

      this.usersRepository.updateToken(user.id, tokens.access_token);

      this.usersRepository.updateUserType(user.id, 'GOOGLE');

      return true;
    } catch (error) {
      return false;
    }
  }
}
