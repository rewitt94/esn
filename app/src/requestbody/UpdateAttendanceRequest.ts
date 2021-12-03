import { IsNotEmpty, IsEnum, IsUUID } from "class-validator";
import { AttendanceStatus } from "../enums/AttendanceStatus";

export default class UpdateAttendanceRequest {

    constructor(data: any) {
        this.event = data.event!;
        this.AttendanceStatus = data.AttendanceStatus!;
    }

    @IsNotEmpty()
    @IsEnum(AttendanceStatus)
    AttendanceStatus: AttendanceStatus;

    @IsNotEmpty()
    @IsUUID("4")
    event: string;

}