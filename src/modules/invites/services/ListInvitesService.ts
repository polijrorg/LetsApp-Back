import { inject, injectable } from 'tsyringe';
import { container } from 'tsyringe';

import { Invite } from '@prisma/client';

// import AppError from '@shared/errors/AppError';
import IInvitesRepository from '../repositories/IInvitesRepository';
import ListEventsService from './ListEventsService';
import { calendar_v3 } from 'googleapis';

@injectable()
export default class CreateInviteService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async getInvites(email:string): Promise<calendar_v3.Schema$Event[]> {
    const list = container.resolve(ListEventsService);
    const events = await list.getEventsUser(email);  
    console.log(`ListInvitesService 50: Events${JSON.stringify(events)}`);
    // 2. Filtra só os eventos que o usuário raiz NÃO aceitou
    const invites = (events as calendar_v3.Schema$Event[]).filter(event => {
      // encontra o attendee correspondente ao usuário raiz
      const rootAttendee = event.attendees?.find(a => a.email === email);
      // se não existir ou não estiver “accepted”, mantemos o evento
      return !!rootAttendee && rootAttendee.responseStatus !== 'accepted';
    });

    // 3. Retorna só eles
    return invites;
  }
}
