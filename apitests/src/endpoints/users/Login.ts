import fetch from 'node-fetch';
import { AccessTokenResponse } from "../../types/AccessTokenResponse";
import { ErrorResponse } from "../../types/ErrorResponse";
import jwt from "jsonwebtoken";

interface loginReturnType {
    statusCode: number,
    responseBody: AccessTokenResponse | ErrorResponse
}

export const login = async (username: string, password: string): Promise<loginReturnType> => {

    const response = await fetch(process.env.BASE_URL + "/users/login", {
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
    
};

export const loginAndAssertSuccess = async (username: string, password: string): Promise<any> => {

    // @ts-ignore
    const outcome: loginReturnType = await login(
        username,
        password
    );

    expect(outcome.statusCode).toEqual(200);
    // @ts-ignore
    expect(outcome.reponseBody.accessToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);

    // @ts-ignore
    const decoded = jwt.decode(outcome.reponseBody.accessToken);

    // @ts-ignore
    expect(decoded.iat).toBeLessThan(new Date().getTime() / 1000);
    // @ts-ignore
    expect(decoded.exp).toBeGreaterThan(new Date().getTime() / 1000);
    // @ts-ignore
    expect(decoded.exp).toBeLessThanOrEqual(Math.ceil(new Date().getTime() / 1000 + 24 * 60 * 60));

    return outcome;

};

export const loginAndAssertUnauthorised = async (username: string, password: string): Promise<any> => {

    // @ts-ignore
    const outcome: loginReturnType = await login(
        username,
        password
    );

    expect(outcome.statusCode).toEqual(401);
    // @ts-ignore
    expect(outcome.reponseBody.error).toEqual("Unauthorised");

    return outcome;

};

export const loginAndAssertValidationError = async (username: string, password: string): Promise<any> => {

    // @ts-ignore
    const outcome: loginReturnType = await login(
        username,
        password
    );

    expect(outcome.statusCode).toEqual(400);
    // @ts-ignore
    expect(outcome.reponseBody.error).toEqual("Invalid request");

    return outcome;

};