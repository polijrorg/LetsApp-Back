import { PseudoUser } from '@prisma/client';
import ICreatePseudoUserDTO from '../dtos/ICreatePseudoUserDTO';

interface IPseudoUsersRepository {
  create(data: ICreatePseudoUserDTO): Promise<PseudoUser>;
  list(): Promise<PseudoUser[]>;
  findByEmail(email: string): Promise<PseudoUser | null>;
  findByPhone(phone: string): Promise<PseudoUser | null>;
  findById(id: string): Promise<PseudoUser | null>;
  delete(id: string): Promise<void>;
  // getInvites(id: string): Promise<PseudoInvite[]>;
}

export default IPseudoUsersRepository;
