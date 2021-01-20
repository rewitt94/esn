import fetch from 'node-fetch';
import { ErrorResponse } from "../../types/ErrorResponse";

interface CreateUserReturnType {
    statusCode: number,
    responseBody: CreateUserResponse | ErrorResponse
}

interface CreateUserResponse {
    id: string,
    username: string,
    dateCreated: string,
}

export const createUser = async (username: string, password: string): Promise<CreateUserReturnType> => {

    const response = await fetch(process.env.BASE_URL + "/users/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    }).catch((err) => { throw err });
    return {
        statusCode: response.status,
        responseBody: await response.json().catch((err) => { throw err })
    }
    
}

export const createUserAndAssertSuccess = async (username: string, password: string): Promise<any> => {

    const outcome: CreateUserReturnType = await createUser(
        username,
        password
    );

    expect(outcome.statusCode).toEqual(201);

    const responseBody = outcome.responseBody as CreateUserResponse;
    expect(responseBody.username).toEqual(username);
    // @ts-ignore
    expect(responseBody.hashedPassword).toEqual(undefined);
    expect(responseBody.id).toMatch(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/);
    expect(responseBody.dateCreated).toMatch(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/);

    return outcome;

};

export const createUserAndAssertDuplicationError = async (username: string, password: string): Promise<any> => {

    const outcome: CreateUserReturnType = await createUser(
        username,
        password
    );

    expect(outcome.statusCode).toEqual(409);

    const responseBody = outcome.responseBody as ErrorResponse;
    expect(responseBody.error).toEqual("Could not be created");

    return outcome;

};

export const createUserAndAssertValidationError = async (username: string, password: string): Promise<any> => {

    const outcome: CreateUserReturnType = await createUser(
        username,
        password
    );

    expect(outcome.statusCode).toEqual(400);

    const responseBody = outcome.responseBody as ErrorResponse;
    expect(responseBody.error).toEqual("Invalid request");

    return outcome;

};