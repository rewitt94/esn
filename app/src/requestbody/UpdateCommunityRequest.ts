import { IsNotEmpty, IsEnum, IsOptional, IsString } from "class-validator";
import Community from "../entities/Community";
import { CommunityType } from "../enums/CommunityType";

export default class UpdateCommunityRequest {

    constructor(data: any) {
        this.community = data.community!;
        this.name = data.name!;
        this.communityType = data.communityType!;
    }

    @IsNotEmpty()
    @IsString()
    community: string;

    @IsOptional()
    @IsEnum(CommunityType)
    communityType: string;

    @IsNotEmpty()
    @IsOptional()
    name: string;

    toCommunity() {
        const community = new Community();
        community.id = this.community!;
        community.name = this.name!;
        community.communityType = this.communityType!;
        return community
    }

}