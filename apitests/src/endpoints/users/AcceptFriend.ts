import fetch from 'node-fetch';
import { FriendshipStatus } from '../../models/enums/FriendshipStatus';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../HTTPAssertions";

interface AcceptFriendResponse {
    message: string
}

interface AcceptFriendPayload {
    username: string,
    status: FriendshipStatus
}

export class AcceptFriend extends HTTPEndpoint<AcceptFriendPayload, AcceptFriendResponse> {

    httpRequest = async (payload: AcceptFriendPayload, headers: object): Promise<HTTPApiMethodResponse<AcceptFriendResponse>> => {
        const response = await fetch(process.env.BASE_URL! + "/users/friends", {
            method: "PUT",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers),
            body: JSON.stringify(payload)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as AcceptFriendResponse
        }
    }

    assertSuccess = (statusCode: number, responseBody: AcceptFriendResponse): void => {
        expect(statusCode).toEqual(200);
        expect(responseBody.message).toEqual('Friend request accepted');
    }

}