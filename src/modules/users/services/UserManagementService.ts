import { inject, injectable } from 'tsyringe';
import IPseudoUsersRepository from '../repositories/IPseudoUsersRepository';
import IUsersRepository from '../repositories/IUsersRepository';

interface IUnregisteredGuest {
  id: string;
  email?: string;
  phone?: string;
}

interface IResponse {
    registeredGuests: string[];
    unregisteredGuests: IUnregisteredGuest[];
    registeredOptionalGuests: string[];
    unregisteredOptionalGuests: IUnregisteredGuest[];
}

@injectable()
export default class UserManagementService {
  constructor(
      @inject('UsersRepository')
      private usersRepository: IUsersRepository,
      @inject('PseudoUsersRepository')
      private pseudoUsersRepository: IPseudoUsersRepository,
  ) { }

  public async execute(guests: string[], optionalGuests: string[]): Promise<IResponse> {
    const registeredGuests: string[] = [];
    const unregisteredGuests: IUnregisteredGuest[] = [];
    const registeredOptionalGuests: string[] = [];
    const unregisteredOptionalGuests: IUnregisteredGuest[] = [];

    guests.forEach(async (guest) => {
      const userAlreadyExists = await this.usersRepository.findByEmail(guest);
      if (!userAlreadyExists) {
        try {
          const pseudoGuest = await this.pseudoUsersRepository.create({ email: guest, phone: null });
          unregisteredGuests.push({ id: pseudoGuest.id, email: guest });
        } catch (error) {
          console.log('PseudoUser already exists');
        }
      } else {
        registeredGuests.push(guest);
      }
    });

    optionalGuests.forEach(async (optionalGuest) => {
      const userAlreadyExists = await this.usersRepository.findByEmail(optionalGuest);
      if (!userAlreadyExists) {
        try {
          const pseudoOptionalGuest = await this.pseudoUsersRepository.create({ email: optionalGuest, phone: null });
          unregisteredOptionalGuests.push({ id: pseudoOptionalGuest.id, email: optionalGuest });
        } catch (error) {
          console.log('PseudoUser already exists');
        }
      } else {
        registeredOptionalGuests.push(optionalGuest);
      }
    });
    return {
      registeredGuests, unregisteredGuests, registeredOptionalGuests, unregisteredOptionalGuests,
    };
  }
}
