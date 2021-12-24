import { IsNotEmpty, IsUUID, IsEnum } from "class-validator";
import { MembershipStatus } from "../enums/MembershipStatus";
import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export default class Membership {

    @IsNotEmpty()
    @IsUUID("4")
    @PrimaryColumn("uuid")
    id: string;

    @IsNotEmpty()
    @IsEnum(MembershipStatus)
    @Column()
    membershipStatus: MembershipStatus;

    @IsNotEmpty()
    @IsUUID("4")
    @Column()
    community: string;

    @IsNotEmpty()
    @IsUUID("4")
    @Column()
    user: string;

}