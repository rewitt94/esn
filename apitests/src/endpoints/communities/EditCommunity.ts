import fetch from 'node-fetch';
import { CommunityType } from '../../enums/CommunityType';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../../utils/HTTPAssertions";

interface EditCommunityResponse {
    id: string;
    name: string,
    communityType?: CommunityType
    dateCreated: string,
}

interface EditCommunityPayload {
    id: string;
    name: string,
    communityType?: CommunityType
}

export class EditCommunity extends HTTPEndpoint<EditCommunityPayload, EditCommunityResponse> {

    httpRequest = async (payload: EditCommunityPayload, headers: object): Promise<HTTPApiMethodResponse<EditCommunityResponse>> => {
        const response = await fetch(process.env.BASE_URL! + "/communities/", {
            method: "PUT",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers),
            body: JSON.stringify(payload)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as EditCommunityResponse
        }
    }

    assertSuccess = (statusCode: number, responseBody: EditCommunityResponse, requestBody: EditCommunityPayload): void => {
        expect(statusCode).toEqual(200);
        expect(responseBody.name).toEqual(requestBody.name);
        expect(responseBody.communityType).toEqual(requestBody.communityType);
        expect(responseBody.id).toMatch(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/);
    }

}