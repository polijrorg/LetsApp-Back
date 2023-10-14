interface ICreateInviteDTO {
name:string;
begin:string;
end:string;
beginSearch:string;
endSearch:string;
phone:string;
// guests management
guests: string[];
optionalGuests:string[];
pseudoGuests: string[];
pseudoOptionalGuests:string[];
// guests management
description:string;
address:string;
link:string|undefined|null;
state:string
googleId:string;
organizerPhoto:string|null;
organizerName:string;
}

export default ICreateInviteDTO;
