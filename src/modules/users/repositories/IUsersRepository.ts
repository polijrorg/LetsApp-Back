import {
  Contato, Invite, Type, User,
} from '@prisma/client';

import ICreateUserDTO from '../dtos/ICreateUserDTO';
// import IUpdateUserDTO from '../dtos/IUpdateUserDTO';
interface IUpload{
  name:string,
  photo:string,

}
interface IContact{

  email:string,
  phone:string,
  name:string,
  userId:string|null
}
interface IUserContact{
  user:User|null,
  contacts:Contato[]}
interface IUsersRepository {
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithRelations(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findToken(): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  updatePhotoAndName(id: string, data: IUpload): Promise<User>;
  updateEmail(id: string, email: string): Promise<User>;
  findContactsByPhone(phone: string): Promise<IUserContact | null>
  updateToken(id: string, tokens: string): Promise<User>;
  create(data: ICreateUserDTO): Promise<User>;
  addContact(userPhone:string, data: IContact): Promise<User>;
  delete(phone:string): Promise<User>;
  listUsers(): Promise<User[]>;
  findInvite(id: string): Promise<Invite|null>
  listUserEmailByInvite(id: string): Promise<string[]>
  updateMicrosoftRefreshCode(id: string, refreshToken: string): Promise<User>;
  updateMicrosoftExpiresIn(id: string, microsoftExpiresIn: string): Promise<User>;
  updateUserType(id: string, type: Type): Promise<User>;
  findEmailByPhone(phone: string): Promise<string>;
}

export default IUsersRepository;
