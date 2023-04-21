// import { inject, injectable } from 'tsyringe';

// import aws, { S3 } from 'aws-sdk';
// import path from 'path';
// import mime from 'mime';
// import fs from 'fs';

// // import AppError from '@shared/errors/AppError';

// import AppError from '@shared/errors/AppError';
// import multerConfig from '@config/multerConfig';
// import IUsersRepository from '../repositories/IUsersRepository';

// @injectable()
// export default class CreateUserService {
//   constructor(
//     @inject('UsersRepository')
//     private usersRepository: IUsersRepository, private S3Client: S3 = new aws.S3({ region: process.env.AWS_DEFAULT_REGION }),

//   ) { }

//   public async execute(filename:string): Promise<void> {
//     const originalPath = path.resolve(multerConfig.directory, __filename);

//     const ContentType = mime.getType(originalPath);

//     if (!ContentType) throw new AppError('File not found!', 400);

//     const fileContent = await fs.promises.readFile(originalPath);
//     const env = process.env.BUCKET_NAME;
//     if (!env) throw new AppError('File not found!', 400);
//     this.S3Client.putObject({
//       Bucket: env,
//       Key: filename,
//       Body: fileContent,
//       ContentType,
//     }).promise();

//     fs.promises.unlink(originalPath);
//   }
// }
