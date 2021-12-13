import Event from "../entities/Event";
import moment from "moment";
import { v4 as uuid } from "uuid";
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsISO8601 } from "class-validator";

export default class CreateCommunityEventRequest {

    constructor(data: any) {
        this.name = data.name!;
        this.description = data.description!;
        this.community = data.community!;
        this.startTime = data.startTime!;
        this.endTime = data.endTime!;
    }

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsUUID("4")
    community: string;

    @IsNotEmpty()
    @IsISO8601()
    startTime: string;

    @IsNotEmpty()
    @IsISO8601()
    endTime: string;

    toNewEvent(creator: string): Event {
        const event = new Event();
        event.id = uuid();
        event.dateCreated = moment().utc().toISOString();
        event.creator = creator;
        event.name = this.name!;
        event.description = this.description!;
        event.community = this.community!;
        event.startTime = this.startTime!;
        event.endTime = this.endTime!;
        return event
    }

};
