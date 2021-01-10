import { uuid } from "uuidv4";
import dotenv from "dotenv";
import { createUserAndAssertDuplicationError, createUserAndAssertSuccess, createUserAndAssertValidationError } from "../../src/endpoints/users/CreateUser";
import { loginAndAssertSuccess, loginAndAssertUnauthorised, loginAndAssertValidationError } from "../../src/endpoints/users/Login";
import { editUserAndAssertSuccess } from "../../src/endpoints/users/EditUser";

describe("UsersController", () => {

    beforeAll(() => {
        dotenv.config();
    });

    describe("Create user", () => {

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

        it("Cannot create cannot create user due to validation errors", async () => {

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

    describe("Login", () => {
        
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

        it("Login returns unauthorised if account does not exist", async () => {

            const username = uuid()
            const password = "mysecretpassword123";

            await loginAndAssertUnauthorised(username, password);

        });

        it("Login returns unauthorised if password is wrong", async () => {

            const crendentials = await setupLoginTest()

            await loginAndAssertUnauthorised(crendentials.username, "mysecretpassword456");

        });

        it("Login returns unauthorised if username is wrong", async () => {

            const crendentials = await setupLoginTest()

            await loginAndAssertUnauthorised(uuid(), crendentials.password);

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

    describe("Edit User", () => {
        
        const setupEditUserTest = async () => {

            const username = uuid()
            const password = "mysecretpassword123";

            await createUserAndAssertSuccess(username, password);
            const accessToken = await loginAndAssertSuccess(username, password);

            return {
                username,
                password,
                accessToken
            }

        }

        it("Login returns access token", async () => {

            const crendentials = await setupEditUserTest()

            await editUserAndAssertSuccess({
                firstName: "hello",
            }, {
                "Authorizaiton": "Bearer " + crendentials.accessToken
            });

        });

    });

});