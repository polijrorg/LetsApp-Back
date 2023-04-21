import { Request, Response } from 'express';
import { container } from 'tsyringe';

import CreateUserService from '@modules/users/services/CreateUserService';
import VerifyUserService from '@modules/users/services/VerifyUserService';
import AppError from '@shared/errors/AppError';
import UploadUserService from '@modules/users/services/UploadUserService';

export default class UserController {
  public async create(req: Request, res: Response): Promise<Response> {
    const {
      phone,
    } = req.body;

    const createUser = container.resolve(CreateUserService);

    const user = await createUser.execute({
      phone,
    });

    return res.status(201).json(user.phone);
  }

  public async verifyCode(req: Request, res: Response): Promise<Response> {
    const {
      phone, code,
    } = req.body;

    const createUser = container.resolve(VerifyUserService);

    await createUser.execute({
      phone, code,
    });

    return res.status(201).json('OK');
  }

  public async upload(req: Request, res: Response): Promise<Response> {
    const {
      name,
      phone,
    } = req.body;
    const photo = req.file;
    if (!photo) {
      throw new AppError('file not found', 400);
    }
    const uploadUser = container.resolve(UploadUserService);

    const user = await uploadUser.execute({
      name,
      phone,
      photoFile: photo as Express.Multer.File,
    });

    return res.status(201).json(user);
  }
}
