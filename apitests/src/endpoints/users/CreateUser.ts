import fetch from 'node-fetch';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../../utils/HTTPAssertions";

interface CreateUserPayload {
    username: string,
    password: string,
}

interface CreateUserResponse {
    id: string,
    username: string,
    dateCreated: string,
}

export class CreateUser extends HTTPEndpoint<CreateUserPayload, CreateUserResponse> {

    httpRequest = async (payload: CreateUserPayload):  Promise<HTTPApiMethodResponse<CreateUserResponse>> => {
        const response = await fetch(process.env.BASE_URL + "/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err })
        }
    }

    assertSuccess = (statusCode: number, responseBody: CreateUserResponse, requestBody: CreateUserPayload): void => {
        expect(statusCode).toEqual(201);
        expect(responseBody.username).toEqual(requestBody.username);
        // @ts-ignore
        expect(responseBody.hashedPassword).toEqual(undefined);
        expect(responseBody.id).toMatch(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/);
        expect(responseBody.dateCreated).toMatch(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/);
    }
        
}