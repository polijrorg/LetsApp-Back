import { User } from '@prisma/client';

import ICreateUserDTO from '../dtos/ICreateUserDTO';
// import IUpdateUserDTO from '../dtos/IUpdateUserDTO';
interface IUpload{
  name:string,
  photo:string,

}

interface IUsersRepository {
  findByEmailWithRelations(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  updatePhotoAndName(id: string, data: IUpload): Promise<User>;
  updateEmail(id: string, email: string): Promise<User>;
  create(data: ICreateUserDTO): Promise<User>;
}

export default IUsersRepository;
