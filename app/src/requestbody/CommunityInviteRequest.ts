import { IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export default class CommunityInviteRequest {

    constructor(data: any) {
        this.community = data.event!;
        this.invitees = data.invitees!;
    }

    @IsNotEmpty()
    @IsUUID("4")
    community: string;

    @IsOptional()
    @IsUUID("4", { each: true })
    invitees: string[];

};