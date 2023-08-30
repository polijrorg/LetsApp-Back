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
import OutlookAuthUrlService from '@modules/users/services/OutlookAuthUrlService';
import GetGoogleTokensService from '@modules/users/services/GetGoogleTokensService';
import GetOutlookTokensService from '@modules/users/services/GetOutlookTokensService';
import CreateEventService from '@modules/users/services/CreateEventService';
import GetCalendarEventsService from '@modules/users/services/GetCalendarEventsService';
import GetRecommendedTimeService from '@modules/users/services/GetRecommendedTimeService';
import AddContactService from '@modules/users/services/AddContactService';
import UpdateEventStateService from '@modules/users/services/UpdateEventStateService';
import AppError from '@shared/errors/AppError';
import GetUserByPhoneService from '@modules/users/services/GetUserByPhoneService';
import GetUserByEmailService from '@modules/users/services/GetUserByEmailService';
import SuggestNewTimeService from '@modules/users/services/SuggestNewTimeService';
import UpdateEventService from '@modules/users/services/UpdateEventService';

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

  public async getGoogleAuthUrl(req: Request, res: Response): Promise<Response> {
    const urlservice = container.resolve(GoogleAuthUrlService);

    const Url = await urlservice.authenticate();
    return res.status(201).json(Url);
  }

  public async getOutlookAuthUrl(req: Request, res: Response): Promise<Response> {
    const urlservice = container.resolve(OutlookAuthUrlService);

    const Url = await urlservice.authenticate();
    return res.status(201).json(Url);
  }

  public async getGoogleTokens(req: Request, res: Response): Promise<Response> {
    const { code } = req.query;
    const urlservice = container.resolve(GetGoogleTokensService);
    if (!code) throw new AppError('User not found', 400);

    await urlservice.authenticate(code.toString());

    return res.status(201).json('ok');
  }

  public async getOutlookTokens(req: Request, res: Response): Promise<Response> {
    const { code } = req.query;
    const urlservice = container.resolve(GetOutlookTokensService);
    if (!code) throw new AppError('User not found', 400);

    await urlservice.authenticate(code.toString());

    return res.status(201).json('ok');
  }

  public async createEvent(req: Request, res: Response): Promise<Response> {
    const urlservice = container.resolve(CreateEventService);
    const {
      phone, begin, end, attendees, description, address, name, createMeetLink,
    } = req.body;

    const Url = await urlservice.authenticate({
      phone, begin, end, attendees, description, address, name, createMeetLink,
    });
    return res.status(201).json(Url);
  }

  public async updateEventState(req: Request, res: Response): Promise<Response> {
    const urlservice = container.resolve(UpdateEventStateService);
    const {
      email, state, eventId,
    } = req.body;

    const Url = await urlservice.updateEventState({
      email, state, eventId,
    });
    return res.status(201).json(Url);
  }

  public async updateEvent(req: Request, res: Response): Promise<Response> {
    const urlservice = container.resolve(UpdateEventService);
    const {
      phone, begin, end, eventId,
    } = req.body;

    const Url = await urlservice.authenticate({
      phone, begin, end, eventId,
    });
    return res.status(201).json(Url);
  }

  public async getEvents(req: Request, res: Response): Promise<Response> {
    const urlservice = container.resolve(GetCalendarEventsService);
    const { phone } = req.body;

    const Url = await urlservice.authenticate(phone);
    return res.status(201).json(Url);
  }

  public async GetUserByPhone(req: Request, res: Response): Promise<Response> {
    const findUser = container.resolve(GetUserByPhoneService);
    const { phone } = req.params;

    const user = await findUser.execute(phone);
    return res.status(201).json(user);
  }

  public async GetUserByEmail(req: Request, res: Response): Promise<Response> {
    const findUser = container.resolve(GetUserByEmailService);
    const { email } = req.params;

    const user = await findUser.execute(email);
    return res.status(201).json(user);
  }

  public async addContact(req: Request, res: Response): Promise<Response> {
    const createContact = container.resolve(AddContactService);
    const {
      userPhone, phone, name, email,
    } = req.body;

    const Url = await createContact.execute({
      userPhone, phone, name, email,
    });
    return res.status(201).json(Url);
  }

  public async getRecommendedTime(req: Request, res: Response): Promise<Response> {
    const time = container.resolve(GetRecommendedTimeService);
    const {
      phone,
      beginDate,
      endDate,
      beginHour,
      endHour,
      duration,
      mandatoryGuests,
      optionalGuests,
    } = req.body;

    const times = await time.authenticate(
      {
        phone,
        beginDate,
        endDate,
        beginHour,
        endHour,
        duration,
        mandatoryGuests,
        optionalGuests,
      },
    );
    return res.status(201).json(times);
  }

  public async SuggestNewTime(req: Request, res: Response): Promise<Response> {
    const time = container.resolve(SuggestNewTimeService);
    const {
      phone,
      inviteId,
    } = req.body;

    const times = await time.authenticate(
      {
        phone,
        inviteId,
      },
    );
    return res.status(201).json(times);
  }
}
