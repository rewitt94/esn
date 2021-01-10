import fetch from 'node-fetch';
import { AccessTokenResponse } from "../../types/AccessTokenResponse";
import { ErrorResponse } from "../../types/ErrorResponse";

interface editUserReturnType {
    statusCode: number,
    responseBody: AccessTokenResponse | ErrorResponse
}

interface UserEdit {
    
}

export const editUser = async (userEdit: UserEdit, headers: object): Promise<editUserReturnType> => {

    const response = await fetch(process.env.BASE_URL + "/users/login", {
        method: "POST",
        headers: Object.assign(headers, {
            "Content-Type": "application/json"
        }),
        body: JSON.stringify(userEdit)
    }).catch((err) => { throw err });
    return {
        statusCode: response.status,
        // @ts-ignore
        reponseBody: await response.json().catch((err) => { throw err })
    }
    
};

export const editUserAndAssertSuccess = async (userEdit: UserEdit, headers: object): Promise<any> => {

    // @ts-ignore
    const outcome: editUserReturnType = await login(
        userEdit,
        headers
    );
        console.log(outcome)

    expect(outcome.statusCode).toEqual(200);
    // @ts-ignore
    expect(outcome.reponseBody.username).toEqual(username);

    return outcome;

};