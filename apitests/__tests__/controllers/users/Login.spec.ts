import { uuid } from "uuidv4";
import dotenv from "dotenv";
import { createUserAndAssertSuccess } from "../../../src/endpoints/users/CreateUser";
import { loginAndAssertSuccess, loginAndAssertUnauthorized, loginAndAssertValidationError } from "../../../src/endpoints/users/Login";

describe("Login", () => {

    beforeAll(() => {
        dotenv.config();
    });

        
    const setupLoginTest = async () => {

        const username = uuid()
        const password = "mysecretpassword123";

        await createUserAndAssertSuccess(username, password);

        return {
            username,
            password
        }

    }

    it("Login returns access token", async () => {

        const crendentials = await setupLoginTest()

        await loginAndAssertSuccess(crendentials.username, crendentials.password);

    });

    it("Login returns unauthorized if account does not exist", async () => {

        const username = uuid()
        const password = "mysecretpassword123";

        await loginAndAssertUnauthorized(username, password);

    });

    it("Login returns unauthorized if password is wrong", async () => {

        const crendentials = await setupLoginTest()

        await loginAndAssertUnauthorized(crendentials.username, "mysecretpassword456");

    });

    it("Login returns unauthorized if username is wrong", async () => {

        const crendentials = await setupLoginTest()

        await loginAndAssertUnauthorized(uuid(), crendentials.password);

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

        for (const attempt of invalidAttemps) {
            // @ts-ignore
            await loginAndAssertValidationError(attempt.username, attempt.password);
        }

    });

});