/* eslint-disable no-var */
/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line max-classes-per-file
import { Request, Response, NextFunction } from 'express';
import AppError from '@shared/errors/AppError';
import AWS from 'aws-sdk';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import { container, inject } from 'tsyringe';
import { PushNotificationService } from './pushNotificationService';

export interface ISMSProvider {
  sendMessage(phone: string, message: string): Promise<boolean>;
}

class LocalSMSProvider implements ISMSProvider {
  async sendMessage(phone: string, message: string): Promise<boolean> {
    // Fallback local para desenvolvimento/teste
    console.log(`[LOCAL SMS] Para: ${phone}, Mensagem: ${message}`);
    return true;
  }
}

class AWSSSMSProvider implements ISMSProvider {
  async sendMessage(phone: string, message: string): Promise<boolean> {
    AWS.config.update({
      region: process.env.AWS_DEFAULT_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const params = {
      Message: message,
      PhoneNumber: phone,
    };

    try {
      const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' })
        .publish(params)
        .promise();
      const data = await publishTextPromise;
      console.log(
        `fallbackSMSPROVIDER 49:SMS enviado com sucesso via AWS SNS para ${params.PhoneNumber}. MessageID: ${data.MessageId}`,
      );
      return true;
    } catch (err: any) {
      console.error(
        `Falha ao enviar SMS via AWS SNS para ${params.PhoneNumber}:`,
        err.message || err,
      );
      return false;
    }
  }
}
class PushNotificationFallback implements ISMSProvider {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      // Buscar usuário pelo telefone
      const user = await this.usersRepository.findByPhone(phone);
      if (user) {
        const pushService = new PushNotificationService();

        return await pushService.sendNotification({
          userId: user.id,
          title: 'Código por Push',
          body: message,
          data: { type: 'sms_fallback', phone },
        });
      }
      return false;
    } catch (error) {
      console.error('Erro no push fallback:', error);
      return false;
    }
  }
}
export class SMSFallbackProvider {
  private providers: any[];

  constructor(
  ) {
    this.providers = [
      new AWSSSMSProvider(),
      new LocalSMSProvider(),
      new PushNotificationFallback(container.resolve<IUsersRepository>('UsersRepository')), // ← ADICIONAR AQUI
    ];
  }

  async sendSMS(phone: string, message: string): Promise<boolean> {
    for (const provider of this.providers) {
      try {
        const result = await provider.sendMessage(phone, message);

        if (result) {
          return true;
        }
      } catch (error) {
        console.log(`Falha no provedor SMS: ${error}`);
        continue;
      }
    }
    throw new AppError('Todos os provedores de SMS falharam', 500);
  }
}

export const smsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.smsProvider = container.resolve(SMSFallbackProvider);
  next();
};

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      smsProvider?: SMSFallbackProvider;
    }
  }
}
export default SMSFallbackProvider;
