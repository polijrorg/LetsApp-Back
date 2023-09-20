interface ICreateInviteDTO {
name:string;
begin:string;
end:string;
phone:string;
guests: string[];
optionalGuests:string[];
description:string;
address:string;
link:string|undefined|null;
state:string
googleId:string;
organizerPhoto:string|null;
organizerName:string;
}

export default ICreateInviteDTO;
