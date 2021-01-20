import fetch from 'node-fetch';
import { ErrorResponse } from "../../types/ErrorResponse";

interface EditUserReturnType {
    statusCode: number,
    responseBody: UserEditResponse | ErrorResponse
}

interface UserEditResponse {
    id: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
}

interface UserEdit {
    firstName: string,
    lastName: string,
    dateOfBirth: string,
}

export const editUser = async (userEdit: UserEdit, headers: object): Promise<EditUserReturnType> => {

    const response = await fetch(process.env.BASE_URL + "/users/", {
        method: "PUT",
        headers: Object.assign({
            "Content-Type": "application/json"
        }, headers),
        body: JSON.stringify(userEdit)
    }).catch((err) => { throw err });
    return {
        statusCode: response.status,
        responseBody: await response.json().catch((err) => { throw err })
    }
    
};

export const editUserAndAssertSuccess = async (userEdit: UserEdit, headers: object): Promise<any> => {

    const outcome: EditUserReturnType = await editUser(
        userEdit,
        headers
    );

    expect(outcome.statusCode).toEqual(200);

    const responseBody = outcome.responseBody as UserEditResponse;
    expect(responseBody.firstName).toEqual(userEdit.firstName);
    expect(responseBody.lastName).toEqual(userEdit.lastName);
    expect(responseBody.dateOfBirth).toEqual(userEdit.dateOfBirth);

    return outcome;

};

export const editUserAndAssertUnauthorized = async (userEdit: UserEdit, headers: object): Promise<any> => {

    const outcome: EditUserReturnType = await editUser(
        userEdit,
        headers
    );

    expect(outcome.statusCode).toEqual(401);

    const responseBody = outcome.responseBody as ErrorResponse;
    expect(responseBody.error).toEqual("Unauthorized");

    return outcome;

};

export const editUserAndAssertValidationError = async (userEdit: UserEdit, headers: object): Promise<any> => {

    const outcome: EditUserReturnType = await editUser(
        userEdit,
        headers
    );

    expect(outcome.statusCode).toEqual(400);

    const responseBody = outcome.responseBody as ErrorResponse;
    expect(responseBody.error).toEqual("Invalid request");

    return outcome;

};