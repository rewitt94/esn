import fetch from 'node-fetch';
import { CommunityType } from '../../models/enums/CommunityType';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../HTTPAssertions";

interface CreateCommunityResponse {
    name: string,
    communityType: CommunityType
    id: string,
    dateCreated: string,
}

interface CreateCommunityPayload {
    name: string,
    communityType?: CommunityType
}

export class CreateCommunity extends HTTPEndpoint<CreateCommunityPayload, CreateCommunityResponse> {

    httpRequest = async (payload: CreateCommunityPayload, headers: object): Promise<HTTPApiMethodResponse<CreateCommunityResponse>> => {
        const response = await fetch(process.env.BASE_URL! + "/communities/", {
            method: "POST",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers),
            body: JSON.stringify(payload)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as CreateCommunityResponse
        }
    }

    assertSuccess = (statusCode: number, responseBody: CreateCommunityResponse, requestBody: CreateCommunityPayload): void => {
        expect(statusCode).toEqual(201);
        expect(responseBody.name).toEqual(requestBody.name);
        expect(responseBody.communityType).toEqual(requestBody.communityType);
        expect(responseBody.id).toMatch(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/);
        expect(responseBody.dateCreated).toMatch(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/);
    }

}