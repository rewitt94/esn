import { uuid } from "uuidv4";
import dotenv from "dotenv";
import { CreateUser } from "../../../src/endpoints/users/CreateUser";

describe("Create user", () => {

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