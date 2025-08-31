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
    private usersRepository: IUsersRepository
  ) {}

  public async execute(attendees: string[], optionalAttendees: string[]): Promise<IResponse> {
    const guests: string[] = [];
    const pseudoGuests: string[] = [];
    const optionalGuests: string[] = [];
    const pseudoOptionalGuests: string[] = [];
    console.log(`❌❌UserManagementService 45: attendees: ${JSON.stringify(attendees)}`);
    console.log(`❌❌UserManagementService 45: optionalAttendees: ${JSON.stringify(optionalAttendees)}`);
      console.log(`😳UserManagementService 45: guesasasast: `);

    const attendeesPromises = attendees.map(async (guest) => {
      if (guest && guest.includes('@')) {
        const user = await this.usersRepository.findByEmail(guest);
        if (user) {
          guests.push(user.email!);
        } else {
          const pseudo = await urlService.execute({ email: guest, phone: null });
          pseudoGuests.push(pseudo.id);
        }
      } else {
        const user = await this.usersRepository.findByPhone(guest);
        if (user) {
          guests.push(user.email!);
        } else {
          const pseudo = await urlService.execute({ email: null, phone: guest });
          pseudoGuests.push(pseudo.id);
        }
      }
    });
    // console.log(`❌❌UserManagementService 51: Attendees promises: ${JSON.stringify(attendeesPromises)}`);  
    const optionalPromises = optionalAttendees.map(async (optional) => {
      if (optional && optional?.includes('@')) {
        const user = await this.usersRepository.findByEmail(optional);
        if (user) {
          optionalGuests.push(user.email!);
        } else {
          const pseudo = await urlService.execute({ email: optional, phone: null });
          pseudoOptionalGuests.push(pseudo.email!);
        }
      } else {
        const user = await this.usersRepository.findByPhone(optional);
        if (user) {
          optionalGuests.push(user.email!);
        } else {
          const pseudo = await urlService.execute({ email: null, phone: optional });
          pseudoOptionalGuests.push(pseudo.id);
        }
      }
    });

    await Promise.all([...attendeesPromises, ...optionalPromises]);
    return {
      guests,
      pseudoGuests,
      optionalGuests,
      pseudoOptionalGuests,
    };
  }
}
