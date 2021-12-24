import fetch from 'node-fetch';
import { MembershipStatus } from '../../models/enums/MembershipStatus';
import { HTTPEndpoint, HTTPApiMethodResponse } from "../HTTPAssertions";

interface Member {
    id: string;
    firstName: string;
    lastName: string;
    membership: MembershipStatus;
}

export class GetMembers extends HTTPEndpoint<string, Member[], Member[]> {

    httpRequest = async (communityId: string, headers: object): Promise<HTTPApiMethodResponse<Member[]>> => {
        const response = await fetch(process.env.BASE_URL! + "/communities/" + communityId + "/members", {
            method: "GET",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers)
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as Member[]
        }
    }

    assertSuccess = (statusCode: number, responseBody: Member[], _: string, validationData: Member[]): void => {
        expect(statusCode).toEqual(200);
        expect(responseBody).toEqual(validationData);
    }

}