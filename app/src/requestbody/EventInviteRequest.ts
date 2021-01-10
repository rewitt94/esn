import { IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export default class EventInviteRequest {

    constructor(data: any) {
        this.event = data.event!;
        this.invitees = data.invitees!;
    }

    @IsNotEmpty()
    @IsUUID("4")
    event: string;

    @IsOptional()
    @IsUUID("4", { each: true })
    invitees: string[];

};
