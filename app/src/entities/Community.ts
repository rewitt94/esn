import { IsNotEmpty, IsOptional, IsUUID, IsISO8601, IsEnum, IsString } from "class-validator";
import { CommunityType } from "../enums/CommunityType";
import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export default class Community {

    @IsNotEmpty()
    @IsUUID("4")
    @PrimaryColumn("uuid")
    id: string;

    @IsNotEmpty()
    @IsISO8601()
    @Column()
    dateCreated: string;

    @IsOptional()
    @IsEnum(CommunityType)
    @Column({ nullable: true })
    communityType?: string;

    @IsNotEmpty()
    @IsString()
    @Column()
    name: string;

}