import fetch from 'node-fetch';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../HTTPAssertions";

interface CreateInviteEventRequest {
    name: string;
    description: string;
    invitees?: string[];
    startTime: string;
    endTime: string;
}

interface CreateInviteEventResponse {
    id: string;
    dateCreated: string;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
}

export class CreateInviteEvent extends HTTPEndpoint<CreateInviteEventRequest, CreateInviteEventResponse> {

    httpRequest = async (payload: CreateInviteEventRequest, headers: object): Promise<HTTPApiMethodResponse<CreateInviteEventResponse>> => {
        const response = await fetch(process.env.BASE_URL! + "/events/inviteEvent", {
            method: "POST",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers),
            body: JSON.stringify(payload)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as CreateInviteEventResponse
        }
    }

    assertSuccess = (statusCode: number, responseBody: CreateInviteEventResponse, requestBody: CreateInviteEventRequest): void => {
        expect(statusCode).toEqual(201);
        expect(responseBody.id).toMatch(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/);
        expect(responseBody.dateCreated).toMatch(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/);
        expect(responseBody.name).toEqual(requestBody.name);
        expect(responseBody.description).toEqual(requestBody.description);
        expect(responseBody.startTime).toEqual(requestBody.startTime);
        expect(responseBody.endTime).toEqual(requestBody.endTime);
    }

}