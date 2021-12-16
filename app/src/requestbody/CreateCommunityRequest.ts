import moment from "moment";
import { v4 as uuid } from "uuid";
import { IsNotEmpty, MinLength, MaxLength, IsOptional, IsString, IsEnum } from "class-validator";
import { CommunityType } from "../enums/CommunityType";
import Community from "../entities/Community";

export default class CreateCommunityRequest {

    constructor(data: any) {
        this.name = data.name!;
        this.communityType = data.communityType!;
    }

    @IsOptional()
    @IsEnum(CommunityType)
    communityType: string;

    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(50)
    @IsString()
    name: string;

    toNewCommunity(): Community {
        const community = new Community();
        community.id = uuid();
        community.dateCreated = moment().utc().toISOString();
        community.communityType = this.communityType;
        community.name = this.name!;
        return community
    }

};