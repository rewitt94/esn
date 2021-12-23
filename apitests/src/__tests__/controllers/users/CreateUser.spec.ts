import { v4 as uuid } from "uuid";
import dotenv from "dotenv";
import { CreateUser } from "../../../endpoints/users/CreateUser";

describe("Create User", () => {

    const createUser = new CreateUser();

    beforeAll(() => {
        dotenv.config();
    });

    it("Can create user", async () => {

        const username = uuid()
        const password = "mysecretpassword123";
        (await createUser.makeRequest({ username, password }, {})).assertSuccess();

    });

    it("Cannot create same user twice", async () => {

        const username = uuid()
        const password = "mysecretpassword123";
        (await createUser.makeRequest({ username, password })).assertSuccess();
        (await createUser.makeRequest({ username, password })).assertConflictError();

    });

    it("Cannot create user due to validation errors", async () => {

        const invalidAttemps = [
            {
                username: uuid(),
                password: 123
            },
            {
                username: 123,
                password: uuid()
            },
            {
                username: ['hello'],
                password: uuid()
            },
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