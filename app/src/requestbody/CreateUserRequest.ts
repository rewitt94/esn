import User from "../entities/User";
import moment from "moment";
import bcrypt from "bcrypt";
import { uuid } from "uuidv4";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

const saltRounds = 12;

export default class CreateUserRequest {

    constructor(data: any) {
        this.username = data.username!;
        this.password = data.password!;
    }

    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(50)
    username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(50)
    password: string;

    toNewUser(): User {
        const user = new User();
        user.id = uuid();
        user.dateCreated = moment().utc().toISOString();
        user.username = this.username!;
        user.hashedPassword = bcrypt.hashSync(this.password, saltRounds)
        return user
    }

}