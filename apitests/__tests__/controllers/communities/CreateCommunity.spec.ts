import { v4 as uuid } from "uuid";
import faker from "faker";
import dotenv from "dotenv";
import { CreateCommunity } from "../../../src/endpoints/communities/CreateCommunity";
import { TestDataSetup } from "../../../src/utils/TestDataSetup";

describe("Create Community", () => {

    const createCommunity = new CreateCommunity();

    beforeAll(() => {
        dotenv.config();
    });

    it("Can create community", async () => {

        const testData = await TestDataSetup.createUserWithFullAccessToken();
        const name = faker.company.companyName();
        (await createCommunity.makeRequest({ name },  {
            "Authorization": "Bearer " + testData.fullAccessToken
        })).assertSuccess();

    });

    it("Can create communities with the same name", async () => {

        const testData = await TestDataSetup.createUserWithFullAccessToken();
        const name = faker.company.companyName();
        (await createCommunity.makeRequest({ name },  {
            "Authorization": "Bearer " + testData.fullAccessToken
        })).assertSuccess();
        (await createCommunity.makeRequest({ name },  {
            "Authorization": "Bearer " + testData.fullAccessToken
        })).assertSuccess();

    });

    it("Cannot create community without access token", async () => {

        const name = faker.company.companyName();

        (await createCommunity.makeRequest({ name },  {
            "Authorization": "Bearer my.jwt.token"
        })).assertUnauthorizedError();

        (await createCommunity.makeRequest({ name },  {
            "Authorization": ""
        })).assertUnauthorizedError();

        (await createCommunity.makeRequest({ name },  {
            "x-api-key": "mykey"
        })).assertUnauthorizedError();

    });

    it("Cannot create community with initial access token", async () => {

        const testData = await TestDataSetup.createUserAndLogin();
        const name = faker.company.companyName();
        (await createCommunity.makeRequest({ name },  {
            "Authorization": "Bearer " + testData.initialAccessToken
        })).assertForbbidenError();

    });

    it("Cannot create community user due to validation errors", async () => {

        const testData = await TestDataSetup.createUserWithFullAccessToken();
        const invalidAttemps = [
            {
                name: "a"
            },
            {
                name: "mybigcommunity123mybigcommunity123mybigcommunity123mybigcommunity123mybigcommunity123"
            },
            {
                username: uuid(),
            },
            {
                name: undefined
            },
            {
                name: 1 
            }
        ]

        for (const payload of invalidAttemps) {
            // @ts-ignore
            (await createCommunity.makeRequest(payload,  {
                "Authorization": "Bearer " + testData.fullAccessToken
            })).assertValidationError();
        }

    });


});