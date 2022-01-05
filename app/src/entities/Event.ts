import { IsNotEmpty, IsUUID, IsISO8601, IsString, IsOptional } from "class-validator";
import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export default class Event {

    @IsNotEmpty()
    @IsUUID("4")
    @PrimaryColumn("uuid")
    id: string;

    @IsNotEmpty()
    @IsString()
    @Column()
    name: string;

    @IsOptional()
    @IsString()
    @Column()
    description: string;

    @IsNotEmpty()
    @IsISO8601()
    @Column()
    dateCreated: string;

    @IsOptional()
    @IsUUID("4")
    @Column({ nullable: true })
    community: string;

    @IsNotEmpty()
    @IsUUID("4")
    @Column()
    creator: string;

    @IsNotEmpty()
    @IsISO8601()
    @Column()
    startTime: string;

    @IsNotEmpty()
    @IsISO8601()
    @Column()
    endTime: string;

}