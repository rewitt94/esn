import fetch from 'node-fetch';
import { CommunityType } from '../../models/enums/CommunityType';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../HTTPAssertions";

interface CommunityInfo {
    id: string;
    name: string,
    communityType?: CommunityType
    dateCreated?: string,
}

export class GetCommunities extends HTTPEndpoint<undefined, CommunityInfo[], CommunityInfo[]> {

    httpRequest = async (_: undefined, headers: object): Promise<HTTPApiMethodResponse<CommunityInfo[]>> => {
        const response = await fetch(process.env.BASE_URL! + "/communities/", {
            method: "GET",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as CommunityInfo[]
        }
    }

    assertSuccess = (statusCode: number, responseBody: CommunityInfo[], _: undefined, validationData: CommunityInfo[]): void => {
        expect(statusCode).toEqual(200);
        expect(responseBody).toEqual(validationData);
    }

}