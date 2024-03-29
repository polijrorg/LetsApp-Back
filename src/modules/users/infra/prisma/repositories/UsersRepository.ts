import prisma from '@shared/infra/prisma/client';
import {
  Contato, Invite, Prisma, Type, User,
} from '@prisma/client';

import ICreateUserDTO from '@modules/users/dtos/ICreateUserDTO';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';

interface IUpload {
  name: string;
  photo: string;
}
interface IContact {
  email: string;
  phone: string;
  name: string;
  userId: string | null;
}
interface IUserContact {
  user: User | null;
  contacts: Contato[];
}
export default class UsersRepository implements IUsersRepository {
  private ormRepository: Prisma.UserDelegate<
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;

  private ormContactsRepository: Prisma.ContatoDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>

  constructor() {
    this.ormRepository = prisma.user;

    this.ormContactsRepository = prisma.contato;
  }

  public async updateName(id: string, name: string): Promise<User> {
    const user = await this.ormRepository.update({
      where: { id },
      data: { name },
    });

    return user;
  }

  public async findByEmailWithRelations(email: string): Promise<User | null> {
    const user = await this.ormRepository.findFirst({
      where: { email },
    });

    return user;
  }

  public async findByPhone(phone: string): Promise<(User & { contatos: Contato[] }) | null> {
    const user = await this.ormRepository.findUnique({
      where: { phone },
      include: { contatos: true },
    });

    return user;
  }

  public async findContactsByPhone(
    phone: string,
  ): Promise<IUserContact | null> {
    const user = await this.ormRepository.findUnique({
      where: { phone },
    });

    const contacts = await prisma.contato.findMany({
      where: { userId: user?.id },
    });

    return { user, contacts };
  }

  public async findByEmail(email: string): Promise<User | null> {
    const user = await this.ormRepository.findUnique({
      where: { email },
    });

    return user;
  }

  public async findToken(): Promise<User | null> {
    const user = await this.ormRepository.findFirst({
      where: { tokens: '1' },
    });

    return user;
  }

  public async findById(id: string): Promise<User | null> {
    const user = await this.ormRepository.findFirst({
      where: { id },
      include: { contatos: true },
    });

    return user;
  }

  public async updatePhotoAndName(id: string, data: IUpload): Promise<User> {
    const user = await this.ormRepository.update({ where: { id }, data });

    return user;
  }

  public async addContact(userPhone: string, data: IContact): Promise<User> {
    const user = await this.ormRepository.findUnique({
      where: { phone: userPhone },
    });

    if (!user) {
      throw new Error('User not found'); // Handle the case when the user doesn't exist.
    }

    const contact = await prisma.contato.create({
      data: {
        ...data,
        userId: user.id, // Connect the contact to the user.
      },
    });
    const contatosAtualizados = await prisma.user.update({
      where: { id: user.id },
      data: {
        contatos: {
          connect: [{ id: contact.id }], // Adicione o ID do novo contato à lista de contatos do usuário.
        },
      },
      include: { contatos: true }, // Inclua a lista de contatos atualizada no resultado.
    });
    return contatosAtualizados;
  }

  public async updateEmail(id: string, email: string): Promise<User> {
    const user = await this.ormRepository.update({
      where: { id },
      data: { email },
    });

    return user;
  }

  public async updateToken(id: string, tokens: string): Promise<User> {
    const user = await this.ormRepository.update({
      where: { id },
      data: { tokens },
    });

    return user;
  }

  public async create(data: ICreateUserDTO): Promise<User> {
    const user = await this.ormRepository.create({ data });

    return user;
  }

  public async delete(phone: string): Promise<User> {
    const user = await this.ormRepository.delete({ where: { phone } });

    return user;
  }

  public async listUsers(): Promise<User[]> {
    const users = await this.ormRepository.findMany();

    return users;
  }

  public async findInvite(id: string): Promise<Invite | null> {
    const users = await prisma.invite.findUnique({
      where: {
        id,
      },
    });

    return users;
  }

  public async listUserEmailByInvite(id: string): Promise<string[]> {
    const users = await prisma.inviteUser.findMany({
      where: {
        inviteId: id,
      },
      select: { userEmail: true },
    });
    const userEmail = users.map((invite) => invite.userEmail);

    return userEmail;
  }

  public async updateUserType(id: string, type: Type): Promise<User> {
    const user = await this.ormRepository.update({
      where: { id },
      data: { type },
    });

    return user;
  }

  public async findEmailByPhone(phone: string): Promise<string> {
    const user = await this.findByPhone(phone);
    if (!user || !user.email) throw new Error('Attendee user not found');

    return user.email;
  }

  public async findPhoneByEmail(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user || !user.email) throw new Error('Attendee user not found');

    return user.phone;
  }

  public async findTypeByEmail(email: string): Promise<string | null> {
    const user = await this.findByEmail(email);
    if (!user || !user.email) throw new Error('Attendee user not found');

    return user.type;
  }

  public async findByPhoneWithContacts(phone: string): Promise<(User & { contatos: Contato[] }) | null> {
    const user = await this.ormRepository.findUnique({
      where: { phone },
      include: { contatos: true },

    });

    return user;
  }

  // public async updateMicrosoftExpiresIn(
  //   id: string,
  //   microsoftExpiresIn: string,
  // ): Promise<User> {
  //   const user = await this.ormRepository.update({
  //     where: { id },
  //     data: { microsoftExpiresIn },
  //   });

  //   return user;
  // }

  public async findContactByPhone(phone:string, userId:string): Promise<Contato|null> {
    const contact = await this.ormContactsRepository.findFirst({
      where: { phone, userId },
    });

    return contact;
  }

  public async findContactByEmail(email:string, userId:string): Promise<Contato|null> {
    const contact = await this.ormContactsRepository.findFirst({
      where: { email, userId },
    });

    return contact;
  }

  public async updateCode(phone: string, code: number): Promise<User> {
    const user = await this.ormRepository.update({
      where: { phone },
      data: { code },
    });

    return user;
  }
}
