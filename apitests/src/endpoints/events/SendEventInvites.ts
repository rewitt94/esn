import fetch from 'node-fetch';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../HTTPAssertions";

interface SendEventInvitesRequest {
    event: string;
    invitees: string[];
}

interface SendEventInvitesResponse {
    message: string;
}

export class SendEventInvites extends HTTPEndpoint<SendEventInvitesRequest, SendEventInvitesResponse> {

    httpRequest = async (payload: SendEventInvitesRequest, headers: object): Promise<HTTPApiMethodResponse<SendEventInvitesResponse>> => {
        const response = await fetch(process.env.BASE_URL! + "/events/invite", {
            method: "POST",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers),
            body: JSON.stringify(payload)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as SendEventInvitesResponse
        }
    }

    assertSuccess = (statusCode: number, responseBody: SendEventInvitesResponse): void => {
        expect(statusCode).toEqual(201);
        expect(responseBody.message).toEqual("Event invites sent")
    }

}