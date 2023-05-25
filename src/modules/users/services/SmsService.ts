import { inject, injectable } from 'tsyringe';
import AWS from 'aws-sdk';
import IUsersRepository from '../repositories/IUsersRepository';

interface ISmsService {
phone: string,
message: string;
}

@injectable()
export default class SmsService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

  ) { }

  public async execute({ phone, message }:ISmsService): Promise<string> {
    AWS.config.update({
      region: process.env.AWS_DEFAULT_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const params = {
      Message: message,
      PhoneNumber: phone,
    };

    const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' })
      .publish(params)
      .promise();
    publishTextPromise
      .then((data) => {
        console.log(
          `Message ${params.Message} sent to the topic ${params.PhoneNumber}`,
        );
        console.log(`MessageID is ${data.MessageId}`);
      })
      .catch((err) => {
        console.error(err, err.stack);

        return 'Error';
      });

    return 'SMS SENDED';
  }
}
