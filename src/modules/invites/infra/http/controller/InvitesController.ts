/* eslint-disable no-console */
import { Request, Response } from 'express';
import { container } from 'tsyringe';

// import CreateInviteService from '@modules/invites/services/CreateInviteService';
import ListEventsService from '@modules/invites/services/ListEventsService';
import ListInvitesService from '@modules/invites/services/ListInvitesService';
import ListEventsByWeekService from '@modules/invites/services/ListEventsByWeekService';
// import GoogleUpdateInviteStateService from '@modules/invites/services/GoogleUpdateInviteStateService';
import UpdateInviteService from '@modules/invites/services/UpdateInviteService';
import OutlookUpdateInviteState from '@modules/invites/services/OutlookUpdateInviteStateService';
import UpdateInviteStateService from '@modules/invites/services/UpdateInviteStateService';
import AppError from '@shared/errors/AppError';

export default class InviteController {
  // public async create(req: Request, res: Response): Promise<Response> {
  //   const {
  //     name,
  //     begin,
  //     end,
  //     guests,
  //     phone,
  //     description,
  //     address,
  //     googleId,

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
  //     status,
  //     googleId,
  //   });

  //   return res.status(201).json(invite);
  // }

  public async listEventsByUser(req: Request, res: Response): Promise<Response> {
    const list = container.resolve(ListEventsService);
    const { email } = req.body;
    const events = await list.getEventsUser(email);
    console.log(`InvitesController 50: Events${JSON.stringify(events)}`);
    return res.status(201).json(events);
  }

  public async listInvitesByUser(req: Request, res: Response): Promise<Response> {
     console.log('InvitesController → req.body:', req.body);
  console.log('InvitesController → Content-Type:', req.headers['content-type']);
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'É preciso enviar um email no corpo da requisição.' });
    }

    try {
      const invites = await container
        .resolve(ListInvitesService)
        .getInvites(email);

      return res.status(200).json(invites);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
      }
      console.error(err);
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  }

  public async listEventsInAWeekByUser(req: Request, res: Response): Promise<Response> {
    const list = container.resolve(ListEventsByWeekService);
    const { phone } = req.params;
    const invites = await list.execute(phone);

    return res.status(201).json(invites);
  }

  public async UpdateEventState(req: Request, res: Response): Promise<Response> {
    const list = container.resolve(UpdateInviteStateService);
    const { email, state, inviteId } = req.body;

    const invites = await list.execute(inviteId, state, email);

    return res.status(201).json(invites);
  }

  public async UpdateEvent(req: Request, res: Response): Promise<Response> {
    const list = container.resolve(UpdateInviteService);
    const {
      eventId,
      phone,
      begin,
      end,
    } = req.body;
    console.log('222', phone);
    const invites = await list.execute({
      eventId,
      phone,
      begin,
      end,
    });

    return res.status(201).json(invites);
  }

  public async outlookUpdateInviteState(req: Request, res: Response): Promise<Response> {
    const invite = container.resolve(OutlookUpdateInviteState);
    const { email, idInvite, state } = req.body;

    const inviteUser = await invite.execute(email, idInvite, state);

    return res.status(201).json(inviteUser);
  }
}
