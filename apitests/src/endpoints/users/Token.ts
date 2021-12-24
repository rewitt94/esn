import fetch from 'node-fetch';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../HTTPAssertions";
import jwt from "jsonwebtoken";
import { JWTClaims } from '../../models/types/JWTClaims';
import { AccessTokenStatus } from '../../models/enums/AccessTokenStatus';

interface TokenResponse {
    accessToken: string,
}

export class Token extends HTTPEndpoint<undefined, TokenResponse> {

    httpRequest = async (_: undefined, headers: object):  Promise<HTTPApiMethodResponse<TokenResponse>> => {
        const response = await fetch(process.env.BASE_URL! + "/users/token", {
            method: "GET",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as TokenResponse
        }
    }

    assertSuccess = (statusCode: number, responseBody: TokenResponse): void => {
        expect(statusCode).toEqual(200);
        expect(responseBody.accessToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);

        const decoded = jwt.decode(responseBody.accessToken) as JWTClaims;
        expect(decoded.status).toEqual(AccessTokenStatus.FULL);
        expect(decoded.iat).toBeLessThan(new Date().getTime() / 1000);
        expect(decoded.exp).toBeGreaterThan(new Date().getTime() / 1000);
        expect(decoded.exp).toBeLessThanOrEqual(Math.ceil(new Date().getTime() / 1000 + 24 * 60 * 60));
    }

}