import fetch from 'node-fetch';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../HTTPAssertions";

interface UserEditResponse {
    id: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
    username: string,
}

interface UserEdit {
    firstName: string,
    lastName: string,
    dateOfBirth: string,
}

export class EditUser extends HTTPEndpoint<UserEdit, UserEditResponse> {

    httpRequest = async (userId: UserEdit, headers: object):  Promise<HTTPApiMethodResponse<UserEditResponse>> => {
        const response = await fetch(process.env.BASE_URL! + "/users/", {
            method: "PUT",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers),
            body: JSON.stringify(userId)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as UserEditResponse
        }
    }

    assertSuccess = (statusCode: number, responseBody: UserEditResponse, userEdit: UserEdit): void => {
        expect(statusCode).toEqual(200);

        expect(responseBody.firstName).toEqual(userEdit.firstName);
        expect(responseBody.lastName).toEqual(userEdit.lastName);
        expect(responseBody.dateOfBirth).toEqual(userEdit.dateOfBirth);
    }

}