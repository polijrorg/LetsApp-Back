/* eslint-disable no-console */
import { injectable } from 'tsyringe';
import AWS from 'aws-sdk';

import { ISMSProvider } from '@shared/container/providers/SMSProvider/models/ISMSProvider';

@injectable()
export default class AwsSnsSmsProvider implements ISMSProvider {
  // Removido o construtor com UsersRepository, pois não é necessário para o envio de SMS

  public async sendSMS(to: string, message: string): Promise<boolean> {
    AWS.config.update({
      region: process.env.AWS_DEFAULT_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const params = {
      Message: message,
      PhoneNumber: to,
    };

    try {
      const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' })
        .publish(params)
        .promise();
      const data = await publishTextPromise;
      console.log(
        `SMS enviado com sucesso via AWS SNS para ${params.PhoneNumber}. MessageID: ${data.MessageId}`,
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
