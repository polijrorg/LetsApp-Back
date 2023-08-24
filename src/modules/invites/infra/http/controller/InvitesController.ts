import { Request, Response } from 'express';
import { container } from 'tsyringe';

// import CreateInviteService from '@modules/invites/services/CreateInviteService';
import ListEventsService from '@modules/invites/services/ListEventsService';
import ListInvitesService from '@modules/invites/services/ListInvitesService';
import ListEventsByWeekService from '@modules/invites/services/ListEventsByWeekService';
import UpdateEventService from '@modules/invites/services/UpdateEventService';

export default class InviteController {
  // public async create(req: Request, res: Response): Promise<Response> {
  //   const {
  //     name,

  //     begin,
  //     end,
  //     guests,
  //     description,
  //     phone,
  //     address,
  //     link,

  //   } = req.body;
  //   const createInvite = container.resolve(CreateInviteService);
  //   const status = 1;
  //   const invite = await createInvite.execute({
  //     name,
  //     begin,
  //     end,
  //     guests,
  //     phone,
  //     description,
  //     address,
  //     link,
  //     status,
  //     googleId,
  //   });

  //   return res.status(201).json(invite);
  // }

  public async listEventsByUser(req: Request, res: Response): Promise<Response> {
    const list = container.resolve(ListEventsService);
    const { email } = req.body;
    const invites = await list.execute(email);

    return res.status(201).json(invites);
  }

  public async listInvitesByUser(req: Request, res: Response): Promise<Response> {
    const list = container.resolve(ListInvitesService);
    const { email } = req.body;
    const invites = await list.execute(email);

    return res.status(201).json(invites);
  }

  public async listEventsInAWeekByUser(req: Request, res: Response): Promise<Response> {
    const list = container.resolve(ListEventsByWeekService);
    const { phone } = req.params;
    const invites = await list.execute(phone);

    return res.status(201).json(invites);
  }

  public async UpdateEvent(req: Request, res: Response): Promise<Response> {
    const list = container.resolve(UpdateEventService);
    const { email, status, inviteId } = req.body;

    const invites = await list.execute(inviteId, parseInt(status, 10), email);

    return res.status(201).json(invites);
  }
}
