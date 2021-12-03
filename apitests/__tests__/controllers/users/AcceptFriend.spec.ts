import dotenv from "dotenv";
import { uuid } from "uuidv4";
import { AcceptFriend } from "../../../src/endpoints/users/AcceptFriend";
import { FriendshipStatusEnum } from "../../../src/enums/FriendshipStatusEnum";
import { TestDataSetup } from "../../../src/utils/TestDataSetup";

describe("Accept Friend", () => {

    beforeAll(() => {
        dotenv.config();
    });

    const acceptFriend = new AcceptFriend();

    it("Accept friend returns success if authenticated & user has pending invite", async () => {

        const testData = await TestDataSetup.createUserWithPendingFriendRequest();
        (await acceptFriend.makeRequest(
            { username: testData.otherUser.username, status: FriendshipStatusEnum.ACCEPTED }, 
            { "Authorization": "Bearer " + testData.user.fullAccessToken }
        )).assertSuccess();

    });

    it("Cannot accept friend if unauthenticated", async () => {

        const otherUserTestData = await TestDataSetup.createUserWithFullAccessToken();
        (await acceptFriend.makeRequest({ username: otherUserTestData.username, status: FriendshipStatusEnum.ACCEPTED }, { "Authorization": "Bearer " + "ABC" })).assertUnauthorizedError();
        (await acceptFriend.makeRequest({ username: otherUserTestData.username, status: FriendshipStatusEnum.ACCEPTED }, { "Origin": "ESN" })).assertUnauthorizedError();
        (await acceptFriend.makeRequest({ username: otherUserTestData.username, status: FriendshipStatusEnum.ACCEPTED }, {})).assertUnauthorizedError();

    });

    it("Cannot send accept friend request from oneself", async () => {

        const userTestData = await TestDataSetup.createUserWithFullAccessToken();
        (await acceptFriend.makeRequest(
            { username: userTestData.username, status: FriendshipStatusEnum.ACCEPTED }, 
            { "Authorization": "Bearer " + userTestData.fullAccessToken }
        )).assertForbbidenError();

    });

    it("Cannot accept friend request that does not exist", async () => {

        const userTestData = await TestDataSetup.createUserWithFullAccessToken();
        const otherUserTestData = await TestDataSetup.createUserWithFullAccessToken();
        (await acceptFriend.makeRequest(
            { username: otherUserTestData.username, status: FriendshipStatusEnum.ACCEPTED }, 
            { "Authorization": "Bearer " + userTestData.fullAccessToken }
        )).assertForbbidenError();

    });

    it("Cannot accept friend request if user does not exist", async () => {

        const userTestData = await TestDataSetup.createUserWithFullAccessToken();
        (await acceptFriend.makeRequest(
            { username: uuid(), status: FriendshipStatusEnum.ACCEPTED }, 
            { "Authorization": "Bearer " + userTestData.fullAccessToken }
        )).assertForbbidenError();

    });

    it("Cannot accept friend request if users are already friends", async () => {

        const testData = await TestDataSetup.createUsersWhoAreFriends();
        (await acceptFriend.makeRequest(
            { username: testData.otherUser.username, status: FriendshipStatusEnum.ACCEPTED }, 
            { "Authorization": "Bearer " + testData.user.fullAccessToken }
        )).assertForbbidenError();
        (await acceptFriend.makeRequest(
            { username: testData.user.username, status: FriendshipStatusEnum.ACCEPTED }, 
            { "Authorization": "Bearer " + testData.otherUser.fullAccessToken }
        )).assertForbbidenError();

    });

    it("Cannot cannot send invalid payload to accept friend", async () => {

        const user = await TestDataSetup.createUserWithFullAccessToken();
        const otherUser = await TestDataSetup.createUserWithFullAccessToken();

        const invalidAttemps = [
            { username: otherUser.username, status: "pending" }, 
            { username: otherUser.username, status: "rejected" }, 
            { username: "O", status: FriendshipStatusEnum.ACCEPTED }, 
            { username: "thereisafiftycharacterlimitandthisstringisfarfarfarfartoolong", status: FriendshipStatusEnum.ACCEPTED }, 
        ]

        for (const attempt of invalidAttemps) {
            // @ts-ignore
            (await acceptFriend.makeRequest(attempt, { "Authorization": "Bearer " + user.fullAccessToken })).assertValidationError();
        }

    });



});