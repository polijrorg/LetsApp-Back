import msal from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

@injectable()
export default class GetTokensService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) { }

  public async authenticate(code: string): Promise<void> {
    const clientConfig = {
      auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID as string,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      },
    };

    const tokenRequest = {
      code,
      redirectUri: process.env.OUTLOOK_CLIENT_URI as string,
      scopes: ['https://graph.microsoft.com/.default'],
    };

    const cca = new msal.ConfidentialClientApplication(clientConfig);
    const tokens = await cca.acquireTokenByCode(tokenRequest);
    if (!tokens.accessToken) throw new AppError('Token not found', 400);

    const expirationDate = tokens.expiresOn as Date;
    const microsoftExpiresIn = expirationDate.toString();

    const tokenCache = cca.getTokenCache().serialize();
    const refreshCodeObject = (JSON.parse(tokenCache)).RefreshToken;
    const microsoftRefreshCode = refreshCodeObject[Object.keys(refreshCodeObject)[0]].secret;

    const authProvider = {
      getAccessToken: async () => tokens.accessToken,
    };

    const graphClient = Client.initWithMiddleware({ authProvider });
    const userInfo = await graphClient.api('/me').get();

    // Unificar??
    const user = await this.usersRepository.findByEmail(userInfo.mail);
    if (!user) throw new AppError('User not found', 400);
    this.usersRepository.updateToken(user.id, tokens.accessToken);
    this.usersRepository.updateMicrosoftRefreshCode(user.id, microsoftRefreshCode);
    this.usersRepository.updateMicrosoftExpiresIn(user.id, microsoftExpiresIn);

    // const phone = '+5521973242622';

    // const beforeCacheAccess = async (cacheContext: TokenCacheContext) => {
    //   const tokenCache = this.usersRepository.getTokenCache(phone);

    //   if (!tokenCache) {
    //     this.usersRepository.setTokenCache(phone, cacheContext.tokenCache.serialize());
    //   } else {
    //     // found cache data, restore into the cache context
    //     cacheContext.tokenCache.deserialize(tokenCache as unknown as string);
    //   }
    // };

    // const afterCacheAccess = async (cacheContext: TokenCacheContext) => {
    //   if (cacheContext.cacheHasChanged) {
    //     // store changes to db
    //     this.usersRepository.setTokenCache(phone, cacheContext.tokenCache.serialize());
    //   }
    // };

    // const cachePlugin = {
    //   beforeCacheAccess,
    //   afterCacheAccess,
    // };

    // const clientConfig = {
    //   auth: {
    //     clientId: process.env.OUTLOOK_CLIENT_ID as string,
    //     clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
    //   },
    //   cache: {
    //     cachePlugin,
    //   },
    // };

    // const cca = new msal.ConfidentialClientApplication(clientConfig);
    // const cache = cca.getTokenCache().serialize();
    // const account = (JSON.parse(cache)).Account;
    // console.log(account);
  }
}
