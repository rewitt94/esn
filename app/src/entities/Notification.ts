import { IsNotEmpty, IsUUID, IsISO8601, IsEnum, IsOptional } from "class-validator";
import { NotificationType } from "../enums/NotificationType";
import { Entity, PrimaryColumn, Column } from "typeorm";
import moment from "moment";

@Entity()
export default class Notification {

    constructor() {
        this.dateCreated = moment().utc().toISOString();
    }

    @IsNotEmpty()
    @IsUUID("4")
    @PrimaryColumn("uuid")
    id: string;

    @IsNotEmpty()
    @IsISO8601()
    @Column()
    dateCreated: string;

    @IsNotEmpty()
    @IsEnum(NotificationType)
    @Column()
    notificationType: NotificationType;

    @IsNotEmpty()
    @IsUUID()
    @Column()
    receiverId: string;

    @IsNotEmpty()
    @IsUUID()
    @Column()
    senderId: string;

    @IsOptional()
    @IsUUID()
    @Column({ nullable: true })
    subjectId: string;

}