import User from "../entities/User";
import { IsNotEmpty, IsString, IsISO8601, MaxLength } from "class-validator";

export default class UpdateUserRequest {

    constructor(data: any) {
        this.firstName = data.firstName!;
        this.lastName = data.lastName!;
        this.dateOfBirth = data.dateOfBirth!;
    }

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    firstName: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    lastName: string;

    @IsNotEmpty()
    @IsISO8601()
    dateOfBirth: string;

    toUser(userId: string): User {
        const user = new User();
        user.id = userId;
        user.firstName = this.firstName!;
        user.lastName = this.lastName!;
        user.dateOfBirth = this.dateOfBirth!;
        return user
    }

}