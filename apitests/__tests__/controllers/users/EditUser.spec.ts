import { uuid } from "uuidv4";
import dotenv from "dotenv";
import faker from "faker";
import { createUserAndAssertSuccess } from "../../../src/endpoints/users/CreateUser";
import { loginAndAssertSuccess } from "../../../src/endpoints/users/Login";
import { editUserAndAssertSuccess, editUserAndAssertUnauthorized, editUserAndAssertValidationError } from "../../../src/endpoints/users/EditUser";

describe("Edit User", () => {

    beforeAll(() => {
        dotenv.config();
    });    
    
    const setupEditUserTest = async () => {

        const username = uuid()
        const password = "mysecretpassword123";

        await createUserAndAssertSuccess(username, password);
        const outcome = await loginAndAssertSuccess(username, password);

        return {
            username,
            password,
            accessToken: outcome.responseBody.accessToken
        };

    };

    it("Cant edit user returns success if authenticated", async () => {

        const crendentials = await setupEditUserTest();

        await editUserAndAssertSuccess({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            dateOfBirth: faker.date.past(25).toISOString()
        }, {
            "Authorization": "Bearer " + crendentials.accessToken
        });

    });

    it("Cannot edit user if unauthenticated", async () => {

        await editUserAndAssertUnauthorized({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            dateOfBirth: faker.date.past(25).toISOString()
        }, {
            "Authorization": "Bearer " + "ABC"
        });

        // @ts-ignore
        await editUserAndAssertUnauthorized({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            dateOfBirth: faker.date.past(25).toISOString()
        });

        await editUserAndAssertUnauthorized({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            dateOfBirth: faker.date.past(25).toISOString()
        }, {
            "Origin": "ESN"
        });

    });

    it("Cannot edit user due to validation errors", async () => {

        const crendentials = await setupEditUserTest();

        const invalidAttemps = [
            {
                firstName: "",
                lastName: faker.name.lastName(),
                dateOfBirth: faker.date.past(25).toISOString()
            },
            {
                firstName: faker.name.firstName(),
                lastName: "",
                dateOfBirth: faker.date.past(25).toISOString()
            },
            {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                dateOfBirth: ""
            },
            {
                firstName: "thereisafiftycharacterlimitandthisstringisfarfarfarfartoolong",
                lastName: faker.name.lastName(),
                dateOfBirth: faker.date.past(25).toISOString()
            },
            {
                firstName: faker.name.firstName(),
                lastName: "thereisafiftycharacterlimitandthisstringisfarfarfarfartoolong",
                dateOfBirth: faker.date.past(25).toISOString()
            },
            {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                dateOfBirth: "1994T00:00:00.000Z"
            }
        ]

        for (const attempt of invalidAttemps) {
            // @ts-ignore
            await editUserAndAssertValidationError(attempt, { "Authorization": "Bearer " + crendentials.accessToken });
        }

    });
    

});