import { inject, injectable, container } from 'tsyringe';
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
  ) { }

  public async execute(attendees: string[], optionalAttendees: string[]): Promise<IResponse> {
    const guests: string[] = [];
    const pseudoGuests: string[] = [];
    const optionalGuests: string[] = [];
    const pseudoOptionalGuests: string[] = [];

    let phoneRef;
    let emailRef;

    const attendeesPromises = attendees.map(async (guest) => {
      if (guest.includes('@')) {
        const userAlreadyExists = await this.usersRepository.findByEmail(guest);
        if (!userAlreadyExists) {
          emailRef = guest;
          phoneRef = null;
          try {
            const pseudoGuest = await urlService.execute({ email: emailRef, phone: phoneRef });
            pseudoGuests.push(pseudoGuest.id);
          } catch (error) {
            console.log(error.message);
          }
        } else {
          guests.push(userAlreadyExists.email!);
        }
      } else {
        const userAlreadyExists = await this.usersRepository.findByPhone(guest);
        if (!userAlreadyExists) {
          emailRef = null;
          phoneRef = guest;
          try {
            const pseudoGuest = await urlService.execute({ email: emailRef, phone: phoneRef });
            pseudoGuests.push(pseudoGuest.id);
          } catch (error) {
            console.log(error.message);
          }
        } else {
          // user could still have not registered email so this could be a problem for a definitive version
          guests.push(userAlreadyExists.email!);
        }
      }
    });

    const optionalAttendeesPromises = optionalAttendees.map(async (optionalGuest) => {
      if (optionalGuest.includes('@')) {
        const userAlreadyExists = await this.usersRepository.findByEmail(optionalGuest);
        if (!userAlreadyExists) {
          emailRef = optionalGuest;
          phoneRef = null;
          try {
            const pseudoGuest = await urlService.execute({ email: emailRef, phone: phoneRef });
            pseudoGuests.push(pseudoGuest.id);
          } catch (error) {
            console.log(error.message);
          }
        } else {
          guests.push(userAlreadyExists.email!);
        }
      } else {
        const userAlreadyExists = await this.usersRepository.findByPhone(optionalGuest);
        if (!userAlreadyExists) {
          emailRef = null;
          phoneRef = optionalGuest;
          try {
            const pseudoGuest = await urlService.execute({ email: emailRef, phone: phoneRef });
            pseudoGuests.push(pseudoGuest.id);
          } catch (error) {
            console.log(error.message);
          }
        } else {
          guests.push(userAlreadyExists.email!);
        }
      }
    });

    await Promise.all(attendeesPromises.concat(optionalAttendeesPromises));

    return {
      guests, pseudoGuests, optionalGuests, pseudoOptionalGuests,
    };
  }
}
