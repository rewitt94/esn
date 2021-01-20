import fetch from 'node-fetch';
import { ErrorResponse } from "../../types/ErrorResponse";
import jwt from "jsonwebtoken";

interface LoginReturnType {
    statusCode: number,
    responseBody: AccessTokenResponse | ErrorResponse
}

interface JwtPayload {
    iat: string,
    exp: string,

}

export interface AccessTokenResponse {
    accessToken: string,
}

export const login = async (username: string, password: string): Promise<LoginReturnType> => {

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
        responseBody: await response.json().catch((err) => { throw err })
    }
    
};

export const loginAndAssertSuccess = async (username: string, password: string): Promise<any> => {

    const outcome: LoginReturnType = await login(
        username,
        password
    );

    expect(outcome.statusCode).toEqual(200);

    const responseBody = outcome.responseBody as AccessTokenResponse;
    expect(responseBody.accessToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);

    const decoded = jwt.decode(responseBody.accessToken) as JwtPayload;

    expect(decoded.iat).toBeLessThan(new Date().getTime() / 1000);
    expect(decoded.exp).toBeGreaterThan(new Date().getTime() / 1000);
    expect(decoded.exp).toBeLessThanOrEqual(Math.ceil(new Date().getTime() / 1000 + 24 * 60 * 60));

    return outcome;

};

export const loginAndAssertUnauthorized = async (username: string, password: string): Promise<any> => {

    const outcome: LoginReturnType = await login(
        username,
        password
    );

    expect(outcome.statusCode).toEqual(401);

    return outcome;

};

export const loginAndAssertValidationError = async (username: string, password: string): Promise<any> => {

    const outcome: LoginReturnType = await login(
        username,
        password
    );

    expect(outcome.statusCode).toEqual(400);

    const responseBody = outcome.responseBody as ErrorResponse;
    expect(responseBody.error).toEqual("Invalid request");

    return outcome;

};