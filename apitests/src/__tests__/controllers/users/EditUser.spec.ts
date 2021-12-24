import dotenv from "dotenv";
import faker from "faker";
import { EditUser } from "../../../endpoints/users/EditUser";
import { UniqueTestDataSetup } from "../../../testdata/UniqueTestDataSetup";

describe("Edit User", () => {

    beforeAll(() => {
        dotenv.config();
    });

    const editUser = new EditUser()

    it("Edit user returns success if authenticated", async () => {

        const testData = await UniqueTestDataSetup.createUserAndLogin();
        (await editUser.makeRequest({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            dateOfBirth: faker.date.past(25).toISOString()
        }, {
            "Authorization": "Bearer " + testData.initialAccessToken
        })).assertSuccess();

    });

    it("Cannot edit user if unauthenticated", async () => {

        (await editUser.makeRequest({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            dateOfBirth: faker.date.past(25).toISOString()
        }, {
            "Authorization": "Bearer " + "ABC"
        })).assertUnauthorizedError();

        // @ts-ignore
        (await editUser.makeRequest({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            dateOfBirth: faker.date.past(25).toISOString()
        })).assertUnauthorizedError();

        (await editUser.makeRequest({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            dateOfBirth: faker.date.past(25).toISOString()
        }, {
            "Origin": "ESN"
        })).assertUnauthorizedError();

    });

    it("Cannot edit user due to validation errors", async () => {

        const testData = await UniqueTestDataSetup.createUserAndLogin();
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
            (await editUser.makeRequest(attempt, { "Authorization": "Bearer " + testData.initialAccessToken })).assertValidationError();
        }

    });


});