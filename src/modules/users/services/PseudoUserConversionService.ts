import { container, inject, injectable } from 'tsyringe';

import { User, PseudoUser } from '@prisma/client';

// import AppError from '@shared/errors/AppError';

import AppError from '@shared/errors/AppError';
import IPseudoInvitesRepository from '@modules/invites/repositories/IPseudoInvitesRepository';
import IInvitesRepository from '@modules/invites/repositories/IInvitesRepository';
import IUsersRepository from '../repositories/IUsersRepository';
import IPseudoUsersRepository from '../repositories/IPseudoUsersRepository';
import SmsService from './SmsService';

interface IRequest {
  pseudoUserId?: string;
  phone:string;
}

@injectable()
export default class PseudoUserConversionService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('PseudoUsersRepository')
    private pseudoUsersRepository: IPseudoUsersRepository,

    @inject('InvitesRepository')
    private invitesRepository: IInvitesRepository,

    @inject('PseudoInvitesRepository')
    private pseudoInvitesRepository: IPseudoInvitesRepository,

  ) { }

  //   public async execute(pseudoUser: PseudoUser): Promise<User> {

//   }
}
