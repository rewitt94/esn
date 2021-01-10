import { IsNotEmpty, IsUUID, IsEnum } from "class-validator";
import { MembershipType } from "../enums/MembershipType";
import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export default class Membership {

    @IsNotEmpty()
    @IsUUID("4")
    @PrimaryColumn("uuid")
    id: string;

    @IsNotEmpty()
    @IsEnum(MembershipType)
    @Column()
    membershipType: MembershipType;

    @IsNotEmpty()
    @IsUUID("4")
    @Column()
    community: string;

    @IsNotEmpty()
    @IsUUID("4")
    @Column()
    user: string;

}