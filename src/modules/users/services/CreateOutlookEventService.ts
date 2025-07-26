/* eslint-disable no-console */
import { Client } from '@microsoft/microsoft-graph-client';
import { container, inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import CreateInviteService from '@modules/invites/services/CreateInviteService';
import UserManagementService from '@modules/users/services/UserManagementService';
import { Invite } from '@prisma/client';
import IUsersRepository from '../repositories/IUsersRepository';
import {
  buildMsalClient,
  getGraphClient,
  resolveEmails,
  buildEvent,
  tryCreateMeetingLink,
} from '@shared/utils/outlookHelpers/outlookHelpers';

interface IRequest {
  phone: string;
  begin: string;
  end: string;
  beginSearch: string;
  endSearch: string;
  attendees: string[];
  description: string;
  address: string;
  createMeetLink: boolean;
  name: string;
  optionalAttendees: string[];
}

@injectable()
export default class CreateOutlookCalendarEventService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  public async authenticate({
    phone,
    begin,
    end,
    beginSearch,
    endSearch,
    attendees,
    description,
    address,
    name,
    optionalAttendees,
    createMeetLink,
  }: IRequest): Promise<Invite> {
    const user = await this.usersRepository.findByPhone(phone);
    if (!user) throw new AppError('User not found in CreateOutlookEventService', 400);

    console.log(`CreateOutlookEventService 45: User found: ${JSON.stringify(user.tokens)}`);

    const userManagementService = container.resolve(UserManagementService);
    const {
      guests,
      pseudoGuests,
      optionalGuests,
      pseudoOptionalGuests,
    } = await userManagementService.execute(attendees, optionalAttendees);

    const allEmails = [...guests, ...optionalGuests];
    const resolvedEmails = await resolveEmails(
      allEmails,
      this.usersRepository.findEmailByPhone.bind(this.usersRepository)
    );

    const tokenCache = JSON.parse(user?.tokens!);
    const cca = buildMsalClient(JSON.stringify(tokenCache));
    const graphClient: Client = await getGraphClient(cca);

    const event = buildEvent({
      name,
      description,
      address,
      begin,
      end,
      attendees: resolvedEmails,
    });

    await graphClient
      .api('me/events')
      .header('Prefer', 'outlook.timezone="America/Sao_Paulo"')
      .post(event);

    const meeting = createMeetLink
      ? await tryCreateMeetingLink(graphClient, { name, begin, end })
      : null;

    const CreateInviteEvent = container.resolve(CreateInviteService);

    const invite = await CreateInviteEvent.execute({
      name,
      begin,
      end,
      beginSearch,
      endSearch,
      guests,
      optionalGuests,
      pseudoGuests,
      pseudoOptionalGuests,
      phone,
      description,
      address,
      link: meeting?.url || null,
      state: 'accepted',
      googleId: meeting?.conferenceId || 'none',
      organizerPhoto: user.photo,
      organizerName: user.name || 'organizer',
    });

    return invite;
  }
}
