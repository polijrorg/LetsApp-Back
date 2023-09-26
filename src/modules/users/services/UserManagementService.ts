import { inject, injectable, container } from 'tsyringe';
import IPseudoUsersRepository from '../repositories/IPseudoUsersRepository';
import IUsersRepository from '../repositories/IUsersRepository';
import CreatePseudoUserService from './CreatePseudoUserService';

interface IResponse {
    guests: string[];
    pseudoGuests: string[];
    optionalGuests: string[];
    pseudoOptionalGuests: string[];
}

const urlService = container.resolve(CreatePseudoUserService);

@injectable()
export default class UserManagementService {
  constructor(
      @inject('UsersRepository')
      private usersRepository: IUsersRepository,
      @inject('PseudoUsersRepository')
      private pseudoUsersRepository: IPseudoUsersRepository,
  ) { }

  public async execute(attendees: string[], optionalAttendees: string[]): Promise<IResponse> {
    const guests: string[] = [];
    const pseudoGuests: string[] = [];
    const optionalGuests: string[] = [];
    const pseudoOptionalGuests: string[] = [];

    let phoneRef;
    let emailRef;

    attendees.forEach(async (guest) => {
      const userAlreadyExists = await this.usersRepository.findByEmail(guest);
      if (!userAlreadyExists) {
        try {
          if (guest.includes('@')) {
            emailRef = guest;
            phoneRef = null;
            const pseudoGuest = await urlService.execute({ email: emailRef, phone: phoneRef });
            pseudoGuests.push(pseudoGuest.email as string);
          } else {
            emailRef = null;
            phoneRef = guest;
            const pseudoGuest = await urlService.execute({ email: emailRef, phone: phoneRef });
            pseudoGuests.push(pseudoGuest.phone as string);
          }
        } catch (error) {
          console.log(error.message);
        }
      } else {
        guests.push(guest);
      }
    });

    optionalAttendees.forEach(async (optionalGuest) => {
      const userAlreadyExists = await this.usersRepository.findByEmail(optionalGuest);
      if (!userAlreadyExists) {
        try {
          if (optionalGuest.includes('@')) {
            emailRef = optionalGuest;
            phoneRef = null;
            const pseudoOptionalGuest = await urlService.execute({ email: emailRef, phone: phoneRef });
            pseudoOptionalGuests.push(pseudoOptionalGuest.email as string);
          } else {
            emailRef = null;
            phoneRef = optionalGuest;
            const pseudoOptionalGuest = await urlService.execute({ email: emailRef, phone: phoneRef });
            pseudoOptionalGuests.push(pseudoOptionalGuest.phone as string);
          }
        } catch (error) {
          console.log(error.message);
        }
      } else {
        optionalGuests.push(optionalGuest);
      }
    });

    return {
      guests, pseudoGuests, optionalGuests, pseudoOptionalGuests,
    };
  }
}
