/* eslint-disable import/extensions */
import { container } from 'tsyringe';

import './providers';
// Users
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import UsersRepository from '@modules/users/infra/prisma/repositories/UsersRepository';
// PseudoUsers
import IPseudoUsersRepository from '@modules/users/repositories/IPseudoUsersRepository';
import PseudoUsersRepository from '@modules/users/infra/prisma/repositories/PseudoUsersRepository';
// Invites
import IInvitesRepository from '@modules/invites/repositories/IInvitesRepository';
import InvitesRepository from '@modules/invites/infra/prisma/repositories/InvitesRepository';
import { SMSFallbackProvider } from '@shared/infra/http/middleware/fallbackSMSProvider';
import ListEventsService from '@modules/invites/services/ListEventsByWeekService';

container.registerSingleton<IUsersRepository>('UsersRepository', UsersRepository);
container.registerSingleton<IPseudoUsersRepository>('PseudoUsersRepository', PseudoUsersRepository);
container.registerSingleton<IInvitesRepository>('InvitesRepository', InvitesRepository);
container.registerSingleton<ListEventsService>(
  'ListEventsService',
  ListEventsService,
);
container.registerSingleton<SMSFallbackProvider>('SMSFallbackProvider', SMSFallbackProvider);
