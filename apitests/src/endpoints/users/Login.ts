import fetch from 'node-fetch';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../HTTPAssertions";
import jwt from "jsonwebtoken";
import { JWTClaims } from '../../models/types/JWTClaims';
import { AccessTokenStatus } from '../../models/enums/AccessTokenStatus';

interface LoginPayload {
    username: string,
    password: string,
}

interface LoginResponse {
    accessToken: string,
}

export class Login extends HTTPEndpoint<LoginPayload, LoginResponse, AccessTokenStatus> {

    httpRequest = async (payload: LoginPayload):  Promise<HTTPApiMethodResponse<LoginResponse>> => {
        const response = await fetch(process.env.BASE_URL! + "/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as LoginResponse
        }
    }

    assertSuccess = (statusCode: number, responseBody: LoginResponse, requestBody: LoginPayload, expectedStatus?: AccessTokenStatus): void => {
        expect(statusCode).toEqual(200);
        expect(responseBody.accessToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);

        const decoded = jwt.decode(responseBody.accessToken) as JWTClaims;

        if (!!expectedStatus) {
            expect(decoded.status).toEqual(expectedStatus);
        }
        expect(decoded.username).toEqual(requestBody.username);
        expect(decoded.iat).toBeLessThan(new Date().getTime() / 1000);
        expect(decoded.exp).toBeGreaterThan(new Date().getTime() / 1000);
        expect(decoded.exp).toBeLessThanOrEqual(Math.ceil(new Date().getTime() / 1000 + 24 * 60 * 60));
    }

}