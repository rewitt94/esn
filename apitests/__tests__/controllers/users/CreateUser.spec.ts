import { uuid } from "uuidv4";
import dotenv from "dotenv";
import { createUserAndAssertDuplicationError, createUserAndAssertSuccess, createUserAndAssertValidationError } from "../../../src/endpoints/users/CreateUser";

describe("Create user", () => {

    beforeAll(() => {
        dotenv.config();
    });

    it("Can create user", async () => {

        const username = uuid()
        const password = "mysecretpassword123";

        await createUserAndAssertSuccess(username, password);

    });

    it("Cannot create same user twice", async () => {

        const username = uuid()
        const password = "mysecretpassword123";

        await createUserAndAssertSuccess(username, password);
        await createUserAndAssertDuplicationError(username, password);

    });

    it("Cannot create user due to validation errors", async () => {

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

        for (const attempt of invalidAttemps) {
            // @ts-ignore
            await createUserAndAssertValidationError(attempt.username, attempt.password);
        }

    });


});