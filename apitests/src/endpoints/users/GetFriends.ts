import fetch from 'node-fetch';
import { FriendshipStatus } from '../../enums/FriendshipStatus';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../../utils/HTTPAssertions";

interface UserInfo {
    id: string,
    username: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
}

export class GetFriends extends HTTPEndpoint<FriendshipStatus, UserInfo[], UserInfo[]> {

    httpRequest = async (friendshipStatus: FriendshipStatus, headers: object): Promise<HTTPApiMethodResponse<UserInfo[]>> => {
        const response = await fetch(process.env.BASE_URL + "/users/friends?status=" + friendshipStatus, {
            method: "GET",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err })
        }
    }

    assertSuccess = (statusCode: number, responseBody: UserInfo[], _: FriendshipStatus, validationData: UserInfo[]): void => {
        expect(statusCode).toEqual(200);

        if (validationData) {
            expect(responseBody).toEqual(validationData);
        }
    }
        
}