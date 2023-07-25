import { Request, Response } from 'express';
import { container } from 'tsyringe';

import CreateInviteService from '@modules/invites/services/CreateInviteService';
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
      address,
      link,

    } = req.body;
    const createInvite = container.resolve(CreateInviteService);

    const invite = await createInvite.execute({
      name,
      date,
      beginHour,
      endHour,
      guests,
      description,
      address,
      link,

    });

    return res.status(201).json(invite);
  }

  public async listAll(req: Request, res: Response): Promise<Response> {
    const list = container.resolve(ListInvitesService);

    const invites = await list.execute();

    return res.status(201).json(invites);
  }
}
