interface ICreateInviteDTO {
name:string;
begin:string;
end:string;
phone:string;
guests:string[];
description:string;
address:string;
link:string|undefined|null;
state:string;
googleId:string;
organizerPhoto:string|null;
organizerName:string|null;

}

export default ICreateInviteDTO;
