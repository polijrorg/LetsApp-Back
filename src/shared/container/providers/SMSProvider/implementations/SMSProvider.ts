/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
import { ISMSProvider } from '../models/ISMSProvider';

export class SMSProvider implements ISMSProvider {
  private providers: ISMSProvider[];

  constructor(providers: ISMSProvider[]) {
    this.providers = providers;
  }

  public async sendSMS(to: string, message: string): Promise<boolean> {
    for (const provider of this.providers) {
      try {
        const success = await provider.sendSMS(to, message);
        if (success) {
          console.log(`SMS enviado com sucesso via ${provider.constructor.name}`);
          return true;
        }
      } catch (error: any) {
        console.error(
          `Falha ao enviar SMS via ${provider.constructor.name}:`,
          error.message,
        );
      }
    }

    console.error('Todos os provedores de SMS falharam.');
    return false;
  }
}
