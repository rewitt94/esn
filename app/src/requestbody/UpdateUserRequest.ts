import User from "../entities/User";
import { IsNotEmpty, IsOptional, IsString, IsISO8601, MaxLength } from "class-validator";

export default class UpdateUserRequest {

    constructor(data: any) {
        this.firstName = data.firstName!;
        this.lastName = data.lastName!;
        this.dateOfBirth = data.dateOfBirth!;
        this.bio = data.bio!;
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

    @IsOptional()
    @IsString()
    @MaxLength(400)
    bio: string;

    toUser(): User {
        const user = new User();
        user.firstName = this.firstName!;
        user.lastName = this.lastName!;
        user.dateOfBirth = this.dateOfBirth!;
        user.bio = this.bio!;
        return user
    }

}