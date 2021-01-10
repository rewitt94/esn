import { IsNotEmpty, IsUUID, IsISO8601, IsEnum } from "class-validator";
import { AttendanceType } from "../enums/AttendanceType";
import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export default class Attendance {

    @IsNotEmpty()
    @IsUUID("4")
    @PrimaryColumn("uuid")
    id: string;

    @IsNotEmpty()
    @IsISO8601()
    @Column()
    lastUpdated: string;

    @IsNotEmpty()
    @IsEnum(AttendanceType)
    @Column()
    attendanceType: AttendanceType;

    @IsNotEmpty()
    @IsUUID("4")
    @Column()
    event: string;

    @IsNotEmpty()
    @IsUUID("4")
    @Column()
    user: string;

}