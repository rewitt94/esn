import { IsNotEmpty, IsUUID } from "class-validator";

export default class UsernameObject {

    constructor(data: any) {
        this.community = data.community!;
    }

    @IsNotEmpty()
    @IsUUID("4")
    community: string;

}