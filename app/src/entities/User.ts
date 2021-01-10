import { IsNotEmpty, IsOptional, IsUUID, IsISO8601, IsString, MinLength, MaxLength } from "class-validator";
import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export default class User {

    @IsNotEmpty()
    @IsUUID("4")
    @PrimaryColumn("uuid")
    id: string;

    @IsNotEmpty()
    @IsISO8601()
    @Column()
    dateCreated: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(50)
    @Column()
    username: string;

    @IsNotEmpty()
    @IsString()
    @Column()
    hashedPassword?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    @Column()
    firstName: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    @Column()
    lastName: string;

    @IsOptional()
    @IsISO8601()
    @Column()
    dateOfBirth: string;

    @IsOptional()
    @IsString()
    @MaxLength(400)
    @Column()
    bio: string;

}