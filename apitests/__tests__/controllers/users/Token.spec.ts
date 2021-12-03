import dotenv from "dotenv";
import { Token } from "../../../src/endpoints/users/Token";
import { TestDataSetup } from "../../../src/utils/TestDataSetup";

describe("Token", () => {

    const token = new Token();

    beforeAll(() => {
        dotenv.config();
    });

    it('returns full access token if when conditions are met', async () => {

        const testData = await TestDataSetup.createUserLoginAndAddDetails();
        (await token.makeRequest(undefined, {
            "Authorization": "Bearer " + testData.initialAccessToken
        })).assertSuccess();

    });

    it('returns an error if user has not populated details', async () => {

        const testData = await TestDataSetup.createUserAndLogin();
        (await token.makeRequest(undefined, {
            "Authorization": "Bearer " + testData.initialAccessToken
        })).assertForbbidenError();

    });

    it("Cannot get token if unauthenticated", async () => {

        (await token.makeRequest(undefined, {
            "Authorization": "Bearer " + "ABC"
        })).assertUnauthorizedError();

        // @ts-ignore
        (await token.makeRequest(undefined)).assertUnauthorizedError();

        (await token.makeRequest(undefined, {
            "Origin": "ESN"
        })).assertUnauthorizedError();

    });

});