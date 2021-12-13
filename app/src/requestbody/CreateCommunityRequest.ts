import moment from "moment";
import { v4 as uuid } from "uuid";
import { IsNotEmpty, IsOptional, IsString, IsEnum } from "class-validator";
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
    @IsString()
    name: string;

    toNewCommunity(): Community {
        const community = new Community();
        community.id = uuid();
        community.id = "6e55cf74-2651-433c-9f6b-a5e183eb59ed";
        community.dateCreated = moment().utc().toISOString();
        community.communityType = this.communityType;
        community.name = this.name!;
        return community
    }

};