import { IsNotEmpty, IsString, MinLength, MaxLength, Equals } from "class-validator";
import { FriendshipStatus } from "../enums/FriendshipStatus";

export default class AcceptFriendshipRequest {

    constructor(data: any) {
        this.username = data.username!;
        this.status = data.status!;
    }

    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(50)
    username: string;

    @IsNotEmpty()
    @Equals(FriendshipStatus.ACCEPTED)
    status: string;

}