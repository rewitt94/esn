import { IsNotEmpty, IsString } from "class-validator";

export default class LoginRequest {

    constructor(data: any) {
        this.username = data.username!;
        this.password = data.password!;
    }

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;

}
