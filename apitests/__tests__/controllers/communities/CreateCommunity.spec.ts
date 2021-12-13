import { v4 as uuid } from "uuid";
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
        const name = uuid();
        (await createCommunity.makeRequest({ name },  {
            "Authorization": "Bearer " + testData.fullAccessToken
        })).assertSuccess();

    });

    it("Can create communities with the same name", async () => {

        const testData = await TestDataSetup.createUserWithFullAccessToken();
        const name = uuid();
        (await createCommunity.makeRequest({ name },  {
            "Authorization": "Bearer " + testData.fullAccessToken
        })).assertSuccess();
        (await createCommunity.makeRequest({ name },  {
            "Authorization": "Bearer " + testData.fullAccessToken
        })).assertSuccess();

    });

    it("Cannot community user due to validation errors", async () => {

        const invalidAttemps = [
            {
                username: "",
                password: "mysecretpassword123"
            },
            {
                username: uuid(),
                password: "aaa"
            },
            {
                username: uuid(),
                password: "mysecretpassword123mysecretpassword123mysecretpassword123mysecretpassword123mysecretpassword123"
            },
            {
                username: uuid(),
                password: ""
            },
            {
                username: undefined,
                password: "mysecretpassword123"
            },
            {
                username: uuid(),
                password: undefined
            }
        ]

        for (const payload of invalidAttemps) {
            // @ts-ignore
            (await createUser.makeRequest(payload)).assertValidationError();
        }

    });


});