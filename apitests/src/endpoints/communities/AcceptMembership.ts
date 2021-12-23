import fetch from 'node-fetch';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../../utils/HTTPAssertions";

interface AcceptMembershipRequest {
    community: string,
}

interface AcceptMembershipResponse {
    message: string
};

export class AcceptMembership extends HTTPEndpoint<AcceptMembershipRequest, AcceptMembershipResponse> {

    httpRequest = async (payload: AcceptMembershipRequest, headers: object): Promise<HTTPApiMethodResponse<AcceptMembershipResponse>> => {
        const response = await fetch(process.env.BASE_URL + "/communities/membership", {
            method: "PUT",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers),
            body: JSON.stringify(payload)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err })
        }
    }

    assertSuccess = (statusCode: number, responseBody: AcceptMembershipResponse, requestBody: AcceptMembershipRequest): void => {
        expect(statusCode).toEqual(200);
        expect(responseBody.message).toEqual('Community invite accepted');
    }
        
}