import { v4 as uuid } from "uuid";
import dotenv from "dotenv";
import faker from "faker";
import { GetUser } from "../../../endpoints/users/GetUser";
import { TestDataSetup } from "../../../utils/TestDataSetup";

describe("Get User", () => {

    beforeAll(() => {
        dotenv.config();
    });

    const getUser = new GetUser();

    it('Can get user if authenticated & is self', async () => {

        const testData = await TestDataSetup.createUserWithFullAccessToken();
        (await getUser.makeRequest(testData.id, {
            "Authorization": "Bearer " + testData.fullAccessToken
        })).assertSuccess({
            id: testData.id,
            username: testData.username,
            firstName: testData.firstName,
            lastName: testData.lastName,
            dateOfBirth: testData.dateOfBirth,
        });

    });

    it('Cannot get user with initial access token', async () => {

        const testData = await TestDataSetup.createUserWithFullAccessToken();
        (await getUser.makeRequest(testData.id, {
            "Authorization": "Bearer " + testData.initialAccessToken
        })).assertForbbidenError();

    });

    it('Can get user if authenticated & is friend', async () => {

        const testData = await TestDataSetup.createUsersWhoAreFriends();

        (await getUser.makeRequest(testData.otherUser.id, {
            "Authorization": "Bearer " + testData.user.fullAccessToken
        })).assertSuccess({
            id: testData.otherUser.id,
            username: testData.otherUser.username,
            firstName: testData.otherUser.firstName,
            lastName: testData.otherUser.lastName,
            dateOfBirth: testData.otherUser.dateOfBirth,
        });

        (await getUser.makeRequest(testData.user.id, {
            "Authorization": "Bearer " + testData.otherUser.fullAccessToken
        })).assertSuccess({
            id: testData.user.id,
            username: testData.user.username,
            firstName: testData.user.firstName,
            lastName: testData.user.lastName,
            dateOfBirth: testData.user.dateOfBirth,
        });


    });

    it('Can get user if authenticated & has friend request from user', async () => {

        const testData = await TestDataSetup.createUserWithPendingFriendRequest();
        (await getUser.makeRequest(testData.otherUser.id, {
            "Authorization": "Bearer " + testData.user.fullAccessToken
        })).assertSuccess({
            id: testData.otherUser.id,
            username: testData.otherUser.username,
            firstName: testData.otherUser.firstName,
            lastName: testData.otherUser.lastName,
            dateOfBirth: testData.otherUser.dateOfBirth,
        });

    });

    it('Validation error if user id is not uuid', async () => {

        const testData = await TestDataSetup.createUserWithFullAccessToken();
        (await getUser.makeRequest(faker.name.findName(), {
            "Authorization": "Bearer " + testData.fullAccessToken
        })).assertValidationError();

    });

    it('Cannot get user if unauthenticated', async () => {

        const testData = await TestDataSetup.createUserWithFullAccessToken();

        (await getUser.makeRequest(testData.id, { "Authorization": "Bearer "})).assertUnauthorizedError();

        (await getUser.makeRequest(testData.id, { "Authorization": "Bearer abc" })).assertUnauthorizedError();

        (await getUser.makeRequest(testData.id)).assertUnauthorizedError();

    });

    it('Cannot get user if authenticated & has sent friend request to user', async () => {

        const testData = await TestDataSetup.createUserWithPendingFriendRequest();
        (await getUser.makeRequest(testData.user.username, {
            "Authorization": "Bearer " + testData.otherUser.fullAccessToken
        })).assertForbbidenError();

    });

    it('Cannot get user if authenticated & are not friends', async () => {

        const userTestData = await TestDataSetup.createUserWithFullAccessToken();
        const otherUserTestData = await TestDataSetup.createUserWithFullAccessToken();
        (await getUser.makeRequest(otherUserTestData.id, {
            "Authorization": "Bearer " + userTestData.fullAccessToken
        })).assertForbbidenError();

    });

    it('Cannot get user if authenticated & user does not exist', async () => {

        const testData = await TestDataSetup.createUserWithFullAccessToken();
        (await getUser.makeRequest(uuid(), {
            "Authorization": "Bearer " + testData.fullAccessToken
        })).assertForbbidenError();

    });

});