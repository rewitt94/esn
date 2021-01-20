import { uuid } from "uuidv4";
import dotenv from "dotenv";
import faker from "faker";
import { createUserAndAssertSuccess } from "../../../src/endpoints/users/CreateUser";
import { loginAndAssertSuccess } from "../../../src/endpoints/users/Login";
import { editUserAndAssertSuccess } from "../../../src/endpoints/users/EditUser";
import { getUserAndAssertSuccess, getUserAndAssertUnauthorized, getUserAndAssertValidationError } from "../../../src/endpoints/users/GetUser";

describe("Get User", () => {

    beforeAll(() => {
        dotenv.config();
    });    
    
    const setupGetUserTest = async () => {

        const username = uuid()
        const password = "mysecretpassword123";
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const dateOfBirth = faker.date.past(25).toISOString();

        const createOutcome = await createUserAndAssertSuccess(username, password);
        const id = createOutcome.responseBody.id;
        const loginOutcome = await loginAndAssertSuccess(username, password);
        const accessToken = loginOutcome.responseBody.accessToken;

        await editUserAndAssertSuccess({
            firstName,
            lastName,
            dateOfBirth
        }, {
            "Authorization": "Bearer " + accessToken
        });

        return {
            id,
            username,
            password,
            firstName,
            lastName,
            dateOfBirth,
            accessToken
        };

    };

    it('Validation error if user id is not uuid', async () => {

        const userInfo = await setupGetUserTest();

        await getUserAndAssertValidationError(
            faker.name.findName(),
            { "Authorization": "Bearer " + userInfo.accessToken }
        );

    });

    it('Cannot get user if unauthenticated', async () => {

        const userInfo = await setupGetUserTest();

        await getUserAndAssertUnauthorized(
            userInfo.id,
            { "Authorization": "Bearer "}
        );

        await getUserAndAssertUnauthorized(
            userInfo.id,
            { "Authorization": "Bearer abc" }
        );

        // @ts-ignore
        await getUserAndAssertUnauthorized(
            userInfo.id
        );

    });

    it('Can get user if authenticated & is self', async () => {

        const userInfo = await setupGetUserTest();

        await getUserAndAssertSuccess({
            id: userInfo.id,
            username: userInfo.username,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            dateOfBirth: userInfo.dateOfBirth,
        }, {
            "Authorization": "Bearer " + userInfo.accessToken
        })

    });

    it('Can get user if authenticated & is friend', async () => {

        // const userInfo = await setupGetUserTest();

        // await getUserAndAssertSuccess({
        //     id: userInfo.id,
        //     username: userInfo.username,
        //     firstName: userInfo.firstName,
        //     lastName: userInfo.lastName,
        //     dateOfBirth: userInfo.dateOfBirth,
        // }, {
        //     "Authorization": "Bearer " + userInfo.accessToken
        // });

    });

    it('Can get user if authenticated & has friend request from user', async () => {

        // const userInfo = await setupGetUserTest();

        // await getUserAndAssertSuccess({
        //     id: userInfo.id,
        //     username: userInfo.username,
        //     firstName: userInfo.firstName,
        //     lastName: userInfo.lastName,
        //     dateOfBirth: userInfo.dateOfBirth,
        // }, {
        //     "Authorization": "Bearer " + userInfo.accessToken
        // });

    });

    it('Cannot get user if authenticated & has sent friend request to user', async () => {

        // const userInfo = await setupGetUserTest();

        // await getUserAndAssertSuccess({
        //     id: userInfo.id,
        //     username: userInfo.username,
        //     firstName: userInfo.firstName,
        //     lastName: userInfo.lastName,
        //     dateOfBirth: userInfo.dateOfBirth,
        // }, {
        //     "Authorization": "Bearer " + userInfo.accessToken
        // });

    });

    it('Cannot get user if authenticated & are not friends', async () => {

        //

    });

    it('Cannot get user if authenticated & user does not exist', async () => {

        //

    });

});