import moment from "moment";
import { uuid } from "uuidv4";
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
        community.dateCreated = moment().utc().toISOString();
        community.communityType = this.communityType;
        community.name = this.name!;
        return community
    }

};