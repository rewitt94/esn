import fetch from 'node-fetch';
import { ErrorResponse } from "../../types/ErrorResponse";

interface GetUserReturnType {
    statusCode: number,
    responseBody: GetUserResponse | ErrorResponse
}

interface GetUserResponse {
    id: string,
    username: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
}

interface GetUserInfo {
    id: string,
    username: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
}

export const getUser = async (userId: string, headers: object): Promise<GetUserReturnType> => {

    const response = await fetch(process.env.BASE_URL + "/users/" + userId, {
        method: "GET",
        headers: Object.assign({
            "Content-Type": "application/json"
        }, headers)
    }).catch((err) => { throw err });
    return {
        statusCode: response.status,
        responseBody: await response.json().catch((err) => { throw err })
    }
    
};

export const getUserAndAssertSuccess = async (info: GetUserInfo,  headers: object): Promise<any> => {

    const outcome: GetUserReturnType = await getUser(
        info.id,
        headers
    );

    expect(outcome.statusCode).toEqual(201);

    const responseBody = outcome.responseBody as GetUserResponse;

    // @ts-ignore
    expect(responseBody.dateCreated).toEqual(undefined);
    // @ts-ignore
    expect(responseBody.hashedPassword).toEqual(undefined);

    expect(responseBody.id).toEqual(info.id);
    expect(responseBody.username).toMatch(info.username);
    expect(responseBody.firstName).toEqual(info.firstName);
    expect(responseBody.lastName).toMatch(info.lastName);
    expect(responseBody.dateOfBirth).toMatch(info.dateOfBirth);

    return outcome;

};

export const getUserAndAssertUnauthorized = async (userId: string,  headers: object): Promise<any> => {

    const outcome: GetUserReturnType = await getUser(
        userId,
        headers
    );

    expect(outcome.statusCode).toEqual(401);

    const responseBody = outcome.responseBody as ErrorResponse;
    expect(responseBody.error).toEqual("Unauthorized");

    return outcome;

};

export const getUserAndAssertValidationError = async (userId: string,  headers: object): Promise<any> => {

    const outcome: GetUserReturnType = await getUser(
        userId,
        headers
    );

    expect(outcome.statusCode).toEqual(400);

    const responseBody = outcome.responseBody as ErrorResponse;
    expect(responseBody.error).toEqual("Invalid request");

    return outcome;

};