import { IsNotEmpty, IsEnum, IsUUID } from "class-validator";
import { AttendanceType } from "../enums/AttendanceType";

export default class UpdateAttendanceRequest {

    constructor(data: any) {
        this.event = data.event!;
        this.attendanceType = data.attendanceType!;
    }

    @IsNotEmpty()
    @IsEnum(AttendanceType)
    attendanceType: AttendanceType;

    @IsNotEmpty()
    @IsUUID("4")
    event: string;

}