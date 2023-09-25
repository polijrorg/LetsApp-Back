interface IUnregisteredGuest {
  id: string;
  email?: string;
  phone?: string;
}

interface ICreatePseudoInviteDTO {
  guests: IUnregisteredGuest[];
  optionalGuests:IUnregisteredGuest[];
}

export default ICreatePseudoInviteDTO;
