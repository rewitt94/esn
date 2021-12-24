import { v4 as uuid } from "uuid";
import dotenv from "dotenv";
import { AddFriend } from "../../../endpoints/users/AddFriend";
import { UniqueTestDataSetup } from "../../../testdata/UniqueTestDataSetup";
import { GetNotifications } from "../../../endpoints/notifications/GetNotifications";
import { NotificationType } from "../../../models/enums/NotificationType";

describe("Add Friend", () => {

    beforeAll(() => {
        dotenv.config();
    });

    const addFriend = new AddFriend()
    const getNotifications = new GetNotifications();

    it("Add friend returns success if authenticated", async () => {

        const userTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const otherUserTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const payload = { username: otherUserTestData.username };
        const headers = { "Authorization": "Bearer " + userTestData.fullAccessToken };
        (await addFriend.makeRequest(payload, headers)).assertSuccess();

    });

    it("Cannot add friend with initial access token", async () => {

        const userTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const otherUserTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const payload = { username: otherUserTestData.username };
        const headers = { "Authorization": "Bearer " + userTestData.initialAccessToken };
        (await addFriend.makeRequest(payload, headers)).assertForbbidenError();

    });

    it("Cannot add friend if unauthenticated", async () => {

        const otherUserTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const payload = { username: otherUserTestData.username };
        (await addFriend.makeRequest(payload, { "Authorization": "Bearer " + "ABC" })).assertUnauthorizedError();
        (await addFriend.makeRequest(payload, { "Origin": "ESN" })).assertUnauthorizedError();
        (await addFriend.makeRequest(payload, {})).assertUnauthorizedError();

    });

    it("Cannot send friend request to oneself", async () => {

        const userTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const payload = { username: userTestData.username };
        const headers = { "Authorization": "Bearer " + userTestData.fullAccessToken };
        (await addFriend.makeRequest(payload, headers)).assertValidationError();

    });

    it("Cannot add friend if friend request already exists", async () => {

        const userTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const otherUserTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const payload = { username: otherUserTestData.username };
        const headers = { "Authorization": "Bearer " + userTestData.fullAccessToken };
        (await addFriend.makeRequest(payload, headers)).assertSuccess();

        // user has already sent
        (await addFriend.makeRequest(
            { username: otherUserTestData.username },
            { "Authorization": "Bearer " + userTestData.fullAccessToken }
        )).assertConflictError();

        // other user has already received
        (await addFriend.makeRequest(
            { username: userTestData.username },
            { "Authorization": "Bearer " + otherUserTestData.fullAccessToken }
        )).assertConflictError();

    });

    it("Cannot add friend if users are already friends", async () => {

        const testData = await UniqueTestDataSetup.createUsersWhoAreFriends();

        (await addFriend.makeRequest(
            { username: testData.user.username },
            { "Authorization": "Bearer " + testData.otherUser.fullAccessToken }
        )).assertConflictError();

        (await addFriend.makeRequest(
            { username: testData.otherUser.username },
            { "Authorization": "Bearer " + testData.user.fullAccessToken }
        )).assertConflictError();

    });


    it("Cannot add friend if user doesn't exists", async () => {

        const userTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        (await addFriend.makeRequest(
            { username: uuid() },
            { "Authorization": "Bearer " + userTestData.fullAccessToken }
        )).assertForbbidenError();

    });

    it("Cannot add friend if username is invalid", async () => {

        const userTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const invalidUsernames = [
            undefined,
            '123',
            'thereisafiftycharacterlimitandthisstringisfarfarfarfartoolong',
        ]

        for (const username of invalidUsernames) {
            (await addFriend.makeRequest(
                // @ts-ignore
                { username },
                { "Authorization": "Bearer " + userTestData.fullAccessToken }
            )).assertValidationError();
        }

    });


    it("Add friend triggers expected notifications", async () => {

        const user = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const otherUser = await UniqueTestDataSetup.createUserWithFullAccessToken();
        (await addFriend.makeRequest(
            { username: otherUser.username }, 
            { "Authorization": "Bearer " + user.fullAccessToken })
        ).assertSuccess();
        (await getNotifications.makeRequest(
            undefined, 
            { "Authorization": "Bearer " + otherUser.fullAccessToken })
        ).assertSuccess([
            {
                notificationType: NotificationType.FRIEND_REQUEST_RECEIVED,
                receiverId: otherUser.id,
                senderId: user.id,
                subjectId: null
            }
        ]);
    });

});