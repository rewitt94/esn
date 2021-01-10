import { IsNotEmpty, IsString, MinLength, MaxLength } from "class-validator";

export default class UsernameObject {

    constructor(data: any) {
        this.username = data.username!;
    }

    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(50)
    username: string;

}