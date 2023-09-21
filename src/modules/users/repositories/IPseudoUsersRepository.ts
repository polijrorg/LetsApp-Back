import { PseudoUser } from '@prisma/client';
import ICreatePseudoUserDTO from '../dtos/ICreatePseudoUserDTO';

interface IPseudoUsersRepository {
  create(data: ICreatePseudoUserDTO): Promise<PseudoUser>;
  list(): Promise<PseudoUser[]>;
  findByEmail(email: string): Promise<PseudoUser | null>;
  findByPhone(phone: string): Promise<PseudoUser | null>;
}

export default IPseudoUsersRepository;
