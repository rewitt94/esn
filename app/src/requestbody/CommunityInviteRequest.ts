import { IsArray, IsNotEmpty, IsUUID } from "class-validator";

export default class CommunityInviteRequest {

    constructor(data: any) {
        this.community = data.community!;
        this.invitees = data.invitees!;
    }

    @IsNotEmpty()
    @IsUUID("4")
    community: string;

    @IsArray()
    @IsUUID("4", { each: true })
    invitees: string[];

};