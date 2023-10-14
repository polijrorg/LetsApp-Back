import { Request, Response } from 'express';
import { container } from 'tsyringe';

// user services
import CreateUserService from '@modules/users/services/CreateUserService';
import VerifyUserService from '@modules/users/services/VerifyUserService';
import UploadUserService from '@modules/users/services/UploadUserService';
import AddEmailToUserService from '@modules/users/services/AddEmailToUserService';
import DeleteUserService from '@modules/users/services/DeleteUserService';
import ListUsersService from '@modules/users/services/ListUsersService';
import ListPseudoUsersService from '@modules/users/services/ListPseudoUsersService';

// url services
import GoogleAuthUrlService from '@modules/users/services/GoogleAuthUrlService';
import OutlookAuthUrlService from '@modules/users/services/OutlookAuthUrlService';

// tokens services
import GetGoogleTokensService from '@modules/users/services/GetGoogleTokensService';
import GetOutlookTokensService from '@modules/users/services/GetOutlookTokensService';

// create event services
import CreateGoogleEventService from '@modules/users/services/CreateGoogleEventService';
import CreateOutlookEventService from '@modules/users/services/CreateOutlookEventService';

// get events services
import GetGoogleCalendarEventsService from '@modules/users/services/GetGoogleCalendarEventsService';
import GetOutlookCalendarEventsService from '@modules/users/services/GetOutlookCalendarEventsService';

import GetRecommendedTimeService from '@modules/users/services/GetRecommendedTimeService';
import AddContactService from '@modules/users/services/AddContactService';
import UpdateEventStateService from '@modules/users/services/UpdateEventStateService';
import AppError from '@shared/errors/AppError';
import GetUserByPhoneService from '@modules/users/services/GetUserByPhoneService';
import GetUserByEmailService from '@modules/users/services/GetUserByEmailService';
import SuggestNewTimeService from '@modules/users/services/SuggestNewTimeService';
import UpdateEventService from '@modules/users/services/UpdateEventService';
import CheckUserAvailabilityService from '@modules/invites/services/CheckUserAvailabilityService';
import NotifyUserbySmsService from '@modules/users/services/NotifyUserBySmsService';
import NotifyUserbyEmailService from '@modules/users/services/NotifyUserByEmailService';
import resendVerificationCodeService from '@modules/users/services/ResendVerificationCodeService';

export default class UserController {
  public async create(req: Request, res: Response): Promise<Response> {
    const {
      phone,
      pseudoUserId,
    } = req.body;
    const createUser = container.resolve(CreateUserService);

    const user = await createUser.execute({
      phone,
      pseudoUserId,
    });

    return res.status(201).json(user);
  }

  public async NotifyBySms(req: Request, res: Response): Promise<Response> {
    const {
      phone,
    } = req.params;
    const createUser = container.resolve(NotifyUserbySmsService);

    const user = await createUser.execute({
      phone,
    });

    return res.status(201).json(user);
  }

  public async NotifyByEmail(req: Request, res: Response): Promise<Response> {
    const {
      email, name,
    } = req.body;
    const createUser = container.resolve(NotifyUserbyEmailService);

    const user = await createUser.execute({
      email, name,
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

    user.tokens = 'secured';

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
      hasPhoto: !!photo,
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

    user.tokens = 'secured';

    return res.status(201).json(user);
  }

  public async listUsers(req: Request, res: Response): Promise<Response> {
    const listUsers = container.resolve(ListUsersService);

    const users = await listUsers.execute();

    users.map((user) => {
      // eslint-disable-next-line no-param-reassign
      user.tokens = 'secured';
      return user;
    });

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
    const { phone } = req.params;

    const Url = await urlservice.authenticate(phone);
    return res.status(201).json(Url);
  }

  public async getOutlookAuthUrl(req: Request, res: Response): Promise<Response> {
    const urlservice = container.resolve(OutlookAuthUrlService);
    const { phone } = req.params;

    const Url = await urlservice.authenticate(phone);
    return res.status(201).json(Url);
  }

  public async getGoogleTokens(req: Request, res: Response): Promise<Response> {
    const { code, state } = req.query;
    const urlservice = container.resolve(GetGoogleTokensService);

    if (!code) throw new AppError('Code not found', 400);
    if (!state) throw new AppError('state not found', 400);
    await urlservice.authenticate(code.toString(), state.toString());

    return res.status(201).json('ok');
  }

  public async getOutlookTokens(req: Request, res: Response): Promise<Response> {
    const { code, state } = req.query;
    const urlservice = container.resolve(GetOutlookTokensService);
    if (!code) throw new AppError('User not found', 400);
    if (!state) throw new AppError('User not found', 400);

    await urlservice.authenticate(code.toString(), state.toString());

    return res.status(201).json('ok');
  }

  public async createGoogleEvent(req: Request, res: Response): Promise<Response> {
    const urlservice = container.resolve(CreateGoogleEventService);
    const {
      phone, begin, end, beginSearch, endSearch, attendees, description, address, name, createMeetLink, optionalAttendees,
    } = req.body;

    const Url = await urlservice.authenticate({
      phone, begin, end, beginSearch, endSearch, attendees, description, address, name, createMeetLink, optionalAttendees,
    });
    return res.status(201).json(Url);
  }

  public async createOutlookEvent(req: Request, res: Response): Promise<Response> {
    const urlservice = container.resolve(CreateOutlookEventService);
    const {
      phone,
      begin,
      end,
      beginSearch,
      endSearch,
      attendees,
      description,
      address,
      name,
      createMeetLink,
      optionalAttendees,
    } = req.body;

    await urlservice.authenticate({
      phone, begin, end, beginSearch, endSearch, attendees, description, address, name, optionalAttendees, createMeetLink,
    });
    return res.status(201).json('ok');
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

  public async getGoogleEvents(req: Request, res: Response): Promise<Response> {
    const urlservice = container.resolve(GetGoogleCalendarEventsService);
    const { email } = req.body;

    const Url = await urlservice.authenticate(email);
    return res.status(201).json(Url);
  }

  public async getOutlookEvents(req: Request, res: Response): Promise<Response> {
    const urlservice = container.resolve(GetOutlookCalendarEventsService);
    const { email } = req.body;

    const Url = await urlservice.authenticate(email);
    return res.status(201).json(Url);
  }

  public async GetUserByPhone(req: Request, res: Response): Promise<Response> {
    const findUser = container.resolve(GetUserByPhoneService);
    const { phone } = req.params;

    const user = await findUser.execute(phone);
    user.user.tokens = 'secured';
    return res.status(201).json(user);
  }

  public async GetUserByEmail(req: Request, res: Response): Promise<Response> {
    const findUser = container.resolve(GetUserByEmailService);
    const { email } = req.params;

    const user = await findUser.execute(email);
    user.user.tokens = 'secured';
    return res.status(201).json(user);
  }

  public async addContact(req: Request, res: Response): Promise<Response> {
    const createContact = container.resolve(AddContactService);
    const {
      userPhone, phone, name, email,
    } = req.body;

    const user = await createContact.execute({
      userPhone, phone, name, email,
    });

    user.tokens = 'secured';

    return res.status(201).json(user);
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

  public async CheckUserAvailability(req: Request, res: Response): Promise<Response> {
    const check = container.resolve(CheckUserAvailabilityService);
    const { id, idInvite } = req.body;

    const checks = await check.execute(id, idInvite);

    return res.status(201).json(checks);
  }

  public async listPseudoUsers(req: Request, res: Response): Promise<Response> {
    const listPseudoUsers = container.resolve(ListPseudoUsersService);

    const pseudoUsers = await listPseudoUsers.execute();

    return res.status(201).json(pseudoUsers);
  }

  public async resendVerificationCode(req: Request, res: Response): Promise<Response> {
    const send = container.resolve(resendVerificationCodeService);

    const { phone } = req.body;

    const user = await send.execute(phone);

    return res.status(201).json(user);
  }
}
