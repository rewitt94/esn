import fetch from 'node-fetch';
import { User } from "../../types/User";
import { ErrorResponse } from "../../types/ErrorResponse";

interface createUserReturnType {
    statusCode: number,
    responseBody: User | ErrorResponse
}

export const createUser = async (username: string, password: string): Promise<createUserReturnType> => {

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
        // @ts-ignore
        reponseBody: await response.json().catch((err) => { throw err })
    }
    
}

export const createUserAndAssertSuccess = async (username: string, password: string): Promise<any> => {

    // @ts-ignore
    const outcome: createUserReturnType = await createUser(
        username,
        password
    );

    expect(outcome.statusCode).toEqual(201);
    // @ts-ignore
    expect(outcome.reponseBody.username).toEqual(username);
    // @ts-ignore
    expect(outcome.reponseBody.id).toMatch(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/);
    // @ts-ignore
    expect(outcome.reponseBody.dateCreated).toMatch(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/);

    return outcome;

};

export const createUserAndAssertDuplicationError = async (username: string, password: string): Promise<any> => {

    // @ts-ignore
    const outcome: createUserReturnType = await createUser(
        username,
        password
    );

    expect(outcome.statusCode).toEqual(409);
    // @ts-ignore
    expect(outcome.reponseBody.error).toEqual("Could not be created");

    return outcome;

};

export const createUserAndAssertValidationError = async (username: string, password: string): Promise<any> => {

    // @ts-ignore
    const outcome: createUserReturnType = await createUser(
        username,
        password
    );

    expect(outcome.statusCode).toEqual(400);
    // @ts-ignore
    expect(outcome.reponseBody.error).toEqual("Invalid request");

    return outcome;

};