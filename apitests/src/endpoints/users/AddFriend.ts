import fetch from 'node-fetch';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../../utils/HTTPAssertions";

interface AddFriendResponse {
    message: string
}

interface AddFriendPayload {
    username: string
}

export class AddFriend extends HTTPEndpoint<AddFriendPayload, AddFriendResponse> {

    httpRequest = async (payload: AddFriendPayload, headers: object):  Promise<HTTPApiMethodResponse<AddFriendResponse>> => {
        const response = await fetch(process.env.BASE_URL! + "/users/friends", {
            method: "POST",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers),
            body: JSON.stringify(payload)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as AddFriendResponse
        }
    }

    assertSuccess = (statusCode: number, responseBody: AddFriendResponse): void => {
        expect(statusCode).toEqual(201);
        expect(responseBody.message).toEqual('Friend request sent');
    }

}