import fetch from 'node-fetch';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../HTTPAssertions";

interface UserInfo {
    id: string,
    username: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
}

export class GetUser extends HTTPEndpoint<string, UserInfo, UserInfo> {

    httpRequest = async (userId: string, headers: object):  Promise<HTTPApiMethodResponse<UserInfo>> => {
        const response = await fetch(process.env.BASE_URL! + "/users/user/" + userId, {
            method: "GET",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers),
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as UserInfo
        }
    }

    assertSuccess = (statusCode: number, responseBody: UserInfo, userId: string, validationData: UserInfo): void => {
        expect(statusCode).toEqual(200);
        expect(userId).toEqual(validationData.id);

        // @ts-ignore
        expect(responseBody.dateCreated).toEqual(undefined);
        // @ts-ignore
        expect(responseBody.hashedPassword).toEqual(undefined);

        expect(responseBody.id).toEqual(validationData.id);
        expect(responseBody.username).toMatch(validationData.username);
        expect(responseBody.firstName).toEqual(validationData.firstName);
        expect(responseBody.lastName).toMatch(validationData.lastName);
        expect(responseBody.dateOfBirth).toMatch(validationData.dateOfBirth);
    }

}