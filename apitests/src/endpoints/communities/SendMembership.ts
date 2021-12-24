import fetch from 'node-fetch';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../HTTPAssertions";

interface CommunityInviteRequest {
    community: string,
    invitees: string[],
}

interface CommunityInviteResponse {
    message: string
}

export class SendMembership extends HTTPEndpoint<CommunityInviteRequest, CommunityInviteResponse> {

    httpRequest = async (payload: CommunityInviteRequest, headers: object): Promise<HTTPApiMethodResponse<CommunityInviteResponse>> => {
        const response = await fetch(process.env.BASE_URL! + "/communities/membership", {
            method: "POST",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers),
            body: JSON.stringify(payload)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as CommunityInviteResponse
        }
    }

    assertSuccess = (statusCode: number, responseBody: CommunityInviteResponse): void => {
        expect(statusCode).toEqual(201);
        expect(responseBody.message).toEqual('Community invites sent');
    }

}