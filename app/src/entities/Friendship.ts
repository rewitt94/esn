import { IsNotEmpty, IsUUID, IsEnum } from "class-validator";
import { FriendshipStatus } from "../enums/FriendshipStatus";
import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export default class Friendship {

    @IsNotEmpty()
    @IsUUID("4")
    @PrimaryColumn("uuid")
    id: string;

    @IsNotEmpty()
    @IsUUID("4")
    @Column()
    userOne: string;

    @IsNotEmpty()
    @IsUUID("4")
    @Column()
    userTwo: string;

    @IsNotEmpty()
    @IsEnum(FriendshipStatus)
    @Column()
    FriendshipStatus: FriendshipStatus;

}