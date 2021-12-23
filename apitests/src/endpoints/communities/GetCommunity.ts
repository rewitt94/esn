import fetch from 'node-fetch';
import { CommunityType } from '../../enums/CommunityType';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../../utils/HTTPAssertions";

interface CommunityInfo {
    id: string;
    name: string,
    communityType?: CommunityType
    dateCreated: string,
}

interface GetCommunityValidationData {
    id: string;
    name: string,
    communityType?: CommunityType
}

export class GetCommunity extends HTTPEndpoint<string, CommunityInfo, GetCommunityValidationData> {

    httpRequest = async (communityId: string, headers: object): Promise<HTTPApiMethodResponse<CommunityInfo>> => {
        const response = await fetch(process.env.BASE_URL! + "/communities/" + communityId, {
            method: "GET",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as CommunityInfo
        }
    }

    assertSuccess = (statusCode: number, responseBody: CommunityInfo, communityId: string, validationData: GetCommunityValidationData): void => {
        expect(statusCode).toEqual(200);
        expect(responseBody.id).toEqual(communityId);
        expect(responseBody.id).toEqual(validationData.id);
        expect(responseBody.name).toEqual(validationData.name);
        expect(responseBody.communityType).toEqual(validationData.communityType);
        expect(responseBody.dateCreated).toMatch(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/);
    }

}