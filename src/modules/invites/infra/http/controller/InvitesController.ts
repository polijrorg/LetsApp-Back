import { Request, Response } from 'express';
import { container } from 'tsyringe';

import CreateInviteService from '@modules/invites/services/CreateInviteService';
import ListEventsService from '@modules/invites/services/ListEventsService';
import ListInvitesService from '@modules/invites/services/ListInvitesService';

export default class InviteController {
  public async create(req: Request, res: Response): Promise<Response> {
    const {
      name,
      date,
      beginHour,
      endHour,
      guests,
      description,
      phone,
      address,
      link,

    } = req.body;
    const createInvite = container.resolve(CreateInviteService);
    const status = 1;
    const invite = await createInvite.execute({
      name,
      date,
      beginHour,
      endHour,
      guests,
      phone,
      description,
      address,
      link,
      status,
    });

    return res.status(201).json(invite);
  }

  public async listEventsByUser(req: Request, res: Response): Promise<Response> {
    const list = container.resolve(ListEventsService);
    const { phone } = req.body;
    console.log(phone);
    const invites = await list.execute(phone);

    return res.status(201).json(invites);
  }

  public async listInvitesByUser(req: Request, res: Response): Promise<Response> {
    const list = container.resolve(ListInvitesService);
    const { phone } = req.body;
    console.log(phone);
    const invites = await list.execute(phone);

    return res.status(201).json(invites);
  }
}
