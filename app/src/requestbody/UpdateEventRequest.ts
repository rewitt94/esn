import Event from "../entities/Event";
import { IsNotEmpty, IsOptional, IsString, IsISO8601, IsUUID } from "class-validator";

export default class UpdateEventRequest {

    constructor(data: any) {
        this.event = data.event!;
        this.name = data.name!;
        this.description = data.description!;
        this.startTime = data.startTime!;
        this.endTime = data.endTime!;
    }

    @IsNotEmpty()
    @IsUUID("4")
    event: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsISO8601()
    startTime: string;

    @IsNotEmpty()
    @IsISO8601()
    endTime: string;

    toEvent(): Event {
        const event = new Event();
        event.id = this.event!;
        event.name = this.name!;
        event.description = this.description!;
        event.startTime = this.startTime!;
        event.endTime = this.endTime!;
        return event
    }

}