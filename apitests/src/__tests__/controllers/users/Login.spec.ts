import { v4 as uuid } from "uuid";
import dotenv from "dotenv";
import { Login } from "../../../endpoints/users/Login";
import { AccessTokenStatus } from "../../../models/enums/AccessTokenStatus";
import { UniqueTestDataSetup } from "../../../testdata/UniqueTestDataSetup";

describe("Login", () => {

    const login = new Login();

    beforeAll(() => {
        dotenv.config();
    });

    it("Login returns initial access token if user details are not populated", async () => {

        const testData = await UniqueTestDataSetup.createUser();
        (await login.makeRequest(testData, {})).assertSuccess(AccessTokenStatus.INTIAL);

    });

    it("Login returns full access token if user details are populated", async () => {

        const testData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        (await login.makeRequest({ username: testData.username, password: testData.password }, {})).assertSuccess(AccessTokenStatus.FULL);

    });

    it("Login returns unauthorized if account does not exist", async () => {

        const username = uuid()
        const password = "mysecretpassword123";
        const payload = { username, password };
        (await login.makeRequest(payload, {})).assertUnauthorizedError();

    });

    it("Login returns unauthorized if password is wrong", async () => {

        const testData = await UniqueTestDataSetup.createUser();
        const payload = { username: testData.username, password: uuid() };
        (await login.makeRequest(payload, {})).assertUnauthorizedError();

    });

    it("Login returns unauthorized if username is wrong", async () => {

        const testData = await UniqueTestDataSetup.createUser();
        const payload = { username: uuid(), password: testData.password };
        (await login.makeRequest(payload, {})).assertUnauthorizedError();

    });

    it("Cannot create cannot create user due to validation errors", async () => {

        const invalidAttemps = [
            {
                username: "",
                password: "mysecretpassword123"
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
            (await login.makeRequest(payload, {})).assertValidationError();
        }

    });

});