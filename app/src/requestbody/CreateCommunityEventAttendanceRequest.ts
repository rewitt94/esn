import moment from "moment";
import { uuid } from "uuidv4";
import { IsNotEmpty, IsEnum, IsString } from "class-validator";
import Attendance from "../entities/Attendance";
import { AttendanceType } from "../enums/AttendanceType";

export default class CreateCommunityEventAttendanceRequest {

    constructor(data: any) {
        this.event = data.event!;
        this.attendanceType = data.attendanceType!;
    }

    @IsNotEmpty()
    @IsString()
    event: string;

    @IsNotEmpty()
    @IsEnum(AttendanceType)
    attendanceType: AttendanceType;

    toNewAttendance(creator: string): Attendance {
        const attendance = new Attendance();
        attendance.id = uuid();
        attendance.lastUpdated = moment().utc().toISOString();
        attendance.event = this.event;
        attendance.attendanceType = this.attendanceType!;
        attendance.user = creator!;
        return attendance
    }

};
