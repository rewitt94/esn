import dotenv from "dotenv";
import { v4 as uuid } from "uuid";
import { GetNotifications } from "../../../endpoints/notifications/GetNotifications";
import { AcceptFriend } from "../../../endpoints/users/AcceptFriend";
import { FriendshipStatus } from "../../../models/enums/FriendshipStatus";
import { NotificationType } from "../../../models/enums/NotificationType";
import { UniqueTestDataSetup } from "../../../testdata/UniqueTestDataSetup";

describe("Accept Friend", () => {

    beforeAll(() => {
        dotenv.config();
    });

    const acceptFriend = new AcceptFriend();
    const getNotifications = new GetNotifications();

    it("Accept friend returns success if authenticated & user has pending invite", async () => {

        const testData = await UniqueTestDataSetup.createUserWithPendingFriendRequest();
        (await acceptFriend.makeRequest(
            { username: testData.otherUser.username, status: FriendshipStatus.ACCEPTED },
            { "Authorization": "Bearer " + testData.user.fullAccessToken }
        )).assertSuccess();

    });

    it("Cannot accept friend with initial access token", async () => {

        const testData = await UniqueTestDataSetup.createUserWithPendingFriendRequest();
        (await acceptFriend.makeRequest(
            { username: testData.otherUser.username, status: FriendshipStatus.ACCEPTED },
            { "Authorization": "Bearer " + testData.user.initialAccessToken }
        )).assertForbbidenError();

    });

    it("Cannot accept friend if unauthenticated", async () => {

        const otherUserTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        (await acceptFriend.makeRequest({ username: otherUserTestData.username, status: FriendshipStatus.ACCEPTED }, { "Authorization": "Bearer " + "ABC" })).assertUnauthorizedError();
        (await acceptFriend.makeRequest({ username: otherUserTestData.username, status: FriendshipStatus.ACCEPTED }, { "Origin": "ESN" })).assertUnauthorizedError();
        (await acceptFriend.makeRequest({ username: otherUserTestData.username, status: FriendshipStatus.ACCEPTED }, {})).assertUnauthorizedError();

    });

    it("Cannot send accept friend request from oneself", async () => {

        const userTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        (await acceptFriend.makeRequest(
            { username: userTestData.username, status: FriendshipStatus.ACCEPTED },
            { "Authorization": "Bearer " + userTestData.fullAccessToken }
        )).assertForbbidenError();

    });

    it("Cannot accept friend request that does not exist", async () => {

        const userTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const otherUserTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        (await acceptFriend.makeRequest(
            { username: otherUserTestData.username, status: FriendshipStatus.ACCEPTED },
            { "Authorization": "Bearer " + userTestData.fullAccessToken }
        )).assertForbbidenError();

    });

    it("Cannot accept friend request if user does not exist", async () => {

        const userTestData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        (await acceptFriend.makeRequest(
            { username: uuid(), status: FriendshipStatus.ACCEPTED },
            { "Authorization": "Bearer " + userTestData.fullAccessToken }
        )).assertForbbidenError();

    });

    it("Cannot accept friend request if users are already friends", async () => {

        const testData = await UniqueTestDataSetup.createUsersWhoAreFriends();
        (await acceptFriend.makeRequest(
            { username: testData.otherUser.username, status: FriendshipStatus.ACCEPTED },
            { "Authorization": "Bearer " + testData.user.fullAccessToken }
        )).assertForbbidenError();
        (await acceptFriend.makeRequest(
            { username: testData.user.username, status: FriendshipStatus.ACCEPTED },
            { "Authorization": "Bearer " + testData.otherUser.fullAccessToken }
        )).assertForbbidenError();

    });

    it("Cannot cannot send invalid payload to accept friend", async () => {

        const user = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const otherUser = await UniqueTestDataSetup.createUserWithFullAccessToken();

        const invalidAttemps = [
            { username: otherUser.username, status: "pending" },
            { username: otherUser.username, status: "rejected" },
            { username: "O", status: FriendshipStatus.ACCEPTED },
            { username: "thereisafiftycharacterlimitandthisstringisfarfarfarfartoolong", status: FriendshipStatus.ACCEPTED },
        ]

        for (const attempt of invalidAttemps) {
            // @ts-ignore
            (await acceptFriend.makeRequest(attempt, { "Authorization": "Bearer " + user.fullAccessToken })).assertValidationError();
        }

    });


    it("Accept friend triggers expected notifications", async () => {

        const testData = await UniqueTestDataSetup.createUserWithPendingFriendRequest();
        (await acceptFriend.makeRequest(
            { username: testData.otherUser.username, status: FriendshipStatus.ACCEPTED },
            { "Authorization": "Bearer " + testData.user.fullAccessToken }
        )).assertSuccess();
        (await getNotifications.makeRequest(
            undefined, 
            { "Authorization": "Bearer " + testData.otherUser.fullAccessToken })
        ).assertSuccess([
            {
                notificationType: NotificationType.FRIEND_REQUEST_ACCEPTED,
                receiverId: testData.otherUser.id,
                senderId: testData.user.id,
                subjectId: null
            }
        ]);

    });

});