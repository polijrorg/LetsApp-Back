import { Request, Response } from 'express';
import { container } from 'tsyringe';

import CreateUserService from '@modules/users/services/CreateUserService';
import VerifyUserService from '@modules/users/services/VerifyUserService';
import UploadUserService from '@modules/users/services/UploadUserService';
import AddEmailToUserService from '@modules/users/services/AddEmailToUserService';
import DeleteUserService from '@modules/users/services/DeleteUserService';
import ListUsersService from '@modules/users/services/ListUsersService';
// import GoogleAuthService from '@modules/users/services/GoogleAuthService';
import GoogleAuthUrlService from '@modules/users/services/GoogleAuthUrlService';
import GetTokensService from '@modules/users/services/GetTokensService';
import CreateEventService from '@modules/users/services/CreateEventService';
import GetCalendarEventsService from '@modules/users/services/GetCalendarEventsService';
// import GetRecommendedTimeService from '@modules/users/services/GetRecommendedTimeService';

export default class UserController {
  public async create(req: Request, res: Response): Promise<Response> {
    const {
      phone,
    } = req.body;
    const createUser = container.resolve(CreateUserService);

    const user = await createUser.execute({
      phone,
    });

    return res.status(201).json(user);
  }

  public async verifyCode(req: Request, res: Response): Promise<Response> {
    const {
      phone, code,
    } = req.body;

    const verifyUser = container.resolve(VerifyUserService);

    const user = await verifyUser.execute({
      phone, code,
    });

    return res.status(201).json(user);
  }

  public async upload(req: Request, res: Response): Promise<Response> {
    const {
      name,
      phone,
    } = req.body;
    const photo = req.file;

    const uploadUser = container.resolve(UploadUserService);

    const user = await uploadUser.execute({
      name,
      phone,
      photoFile: photo as Express.Multer.File| null,
    });

    return res.status(201).json(user);
  }

  public async updateEmail(req: Request, res: Response): Promise<Response> {
    const {
      id, email,
    } = req.body;

    const updateEmail = container.resolve(AddEmailToUserService);

    const user = await updateEmail.execute({
      id, email,
    });

    return res.status(201).json(user);
  }

  public async deleteUser(req: Request, res: Response): Promise<Response> {
    const {
      phone,
    } = req.body;

    const deleteUser = container.resolve(DeleteUserService);

    const user = await deleteUser.execute({
      phone,
    });

    return res.status(201).json(user);
  }

  public async listUsers(req: Request, res: Response): Promise<Response> {
    const listUsers = container.resolve(ListUsersService);

    const users = await listUsers.execute();

    return res.status(201).json(users);
  }

  // public async getcalendar(req: Request, res: Response): Promise<Response> {
  //   const getCalendar = container.resolve(GoogleAuthService);
  //   const clientId = process.env.CLIENTE_ID;
  //   const clientSecret = process.env.CLIENT_SECRET;
  //   const redirectUri = 'https://www.google.com/search?client=firefox-b-d&q=halsey';

  //   if (!clientId || !clientSecret) {
  //     throw new AppError('file not found', 400);
  //   }
  //   const user = await getCalendar.authenticate({
  //     clientId, clientSecret redirectUri,
  //   });

  //   return res.status(201).json(user);
  // }

  public async code(req: Request, res: Response): Promise<Response> {
    const { code } = req.query;

    return res.status(201).json(code);
  }

  public async getAuthUrl(req: Request, res: Response): Promise<Response> {
    const {
      phone,
    } = req.params;
    const urlservice = container.resolve(GoogleAuthUrlService);

    const Url = await urlservice.authenticate(phone);
    return res.status(201).json(Url);
  }

  public async getTokens(req: Request, res: Response): Promise<Response> {
    const urlservice = container.resolve(GetTokensService);
    const { code } = req.query;

    await urlservice.authenticate(code);
    return res.status(201);
  }

  public async createEvent(req: Request, res: Response): Promise<Response> {
    const urlservice = container.resolve(CreateEventService);
    const { phone, begin, end } = req.body;

    const Url = await urlservice.authenticate(phone, begin, end);
    return res.status(201).json(Url);
  }

  public async getEvents(req: Request, res: Response): Promise<Response> {
    const urlservice = container.resolve(GetCalendarEventsService);
    const { phone } = req.body;

    const Url = await urlservice.authenticate(phone);
    return res.status(201).json(Url);
  }

  // public async getRecommendedTime(req: Request, res: Response): Promise<Response> {
  //   const time = container.resolve(GetRecommendedTimeService);
  //   const {
  //     phone,
  //     beginDate,
  //     endDate,
  //     beginHour,
  //     endHour,
  //     duration,
  //     mandatoryGuests,
  //     optionalGuests,
  //   } = req.body;

  //   const times = await time.authenticate(
  //     {
  //       phone,
  //       beginDate,
  //       endDate,
  //       beginHour,
  //       endHour,
  //       duration,
  //       mandatoryGuests,
  //       optionalGuests,
  //     },
  //   );
  //   return res.status(201).json(times);
  // }
}
