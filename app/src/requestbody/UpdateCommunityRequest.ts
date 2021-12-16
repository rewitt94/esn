import { IsNotEmpty, IsEnum, IsUUID, MinLength, MaxLength, IsOptional, IsString } from "class-validator";
import Community from "../entities/Community";
import { CommunityType } from "../enums/CommunityType";

export default class UpdateCommunityRequest {

    constructor(data: any) {
        this.id = data.id!;
        this.name = data.name!;
        this.communityType = data.communityType!;
    }

    @IsNotEmpty()
    @IsUUID("4")
    @IsString()
    id: string;

    @IsOptional()
    @IsEnum(CommunityType)
    communityType: string;

    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(50)
    @IsString()
    name: string;

    toCommunity() {
        const community = new Community();
        community.id = this.id!;
        community.name = this.name!;
        community.communityType = this.communityType!;
        return community
    }

}