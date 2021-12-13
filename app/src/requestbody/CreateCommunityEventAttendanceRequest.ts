import moment from "moment";
import { v4 as uuid } from "uuid";
import { IsNotEmpty, IsEnum, IsString } from "class-validator";
import Attendance from "../entities/Attendance";
import { AttendanceStatus } from "../enums/AttendanceStatus";

export default class CreateCommunityEventAttendanceRequest {

    constructor(data: any) {
        this.event = data.event!;
        this.AttendanceStatus = data.AttendanceStatus!;
    }

    @IsNotEmpty()
    @IsString()
    event: string;

    @IsNotEmpty()
    @IsEnum(AttendanceStatus)
    AttendanceStatus: AttendanceStatus;

    toNewAttendance(creator: string): Attendance {
        const attendance = new Attendance();
        attendance.id = uuid();
        attendance.lastUpdated = moment().utc().toISOString();
        attendance.event = this.event;
        attendance.AttendanceStatus = this.AttendanceStatus!;
        attendance.user = creator!;
        return attendance
    }

};
