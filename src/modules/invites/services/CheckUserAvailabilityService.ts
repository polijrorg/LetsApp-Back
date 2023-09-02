import { Response } from 'express';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { Client } from '@microsoft/microsoft-graph-client';
import IInvitesRepository from '@modules/invites/repositories/IInvitesRepository';

@injectable()
export default class CheckUserAvailabilityService {
  constructor(
    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

  ) { }

  public async execute(id: string, idInvite: string): Promise<Response> {
    // tirar funcao do invitesRepository dps...
    // tirar a rota de teste

    const user = await this.invitesRepository.findById(id);
    if (!user) throw new AppError('User not found', 400);

    const invite = await this.invitesRepository.findInviteById(idInvite);
    if (!invite) throw new AppError('Invite not found', 400);

    const authProvider = {
      getAccessToken: async () => user.tokens as string,
    };

    const graphClient = Client.initWithMiddleware({ authProvider });

    const scheduleInformation = {
      // timezone Monróvia ?????
      schedules: [user.email],
      startTime: {
        dateTime: invite.begin,
        timeZone: 'UTC',
      },
      endTime: {
        dateTime: invite.end,
        timeZone: 'UTC',
      },
      availabilityViewInterval: 30,
    };

    const check = await graphClient.api(`/users/${user.email}/calendar/getSchedule`).post(scheduleInformation);

    return check;
  }
}
