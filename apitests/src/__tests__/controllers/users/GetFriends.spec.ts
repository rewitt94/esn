import dotenv from "dotenv";
import { GetFriends } from "../../../endpoints/users/GetFriends";
import { FriendshipStatus } from "../../../models/enums/FriendshipStatus";
import { UniqueTestDataSetup } from "../../../testdata/UniqueTestDataSetup";


describe("Get Friends", () => {

    beforeAll(() => {
        dotenv.config();
    });

    const getFriends = new GetFriends();

    it('Get ACCEPTED friends returns friends', async () => {

        const numberOfFriends = Math.floor(Math.random() * 4) + 1;
        const testData = await UniqueTestDataSetup.createUserWithNFriends(numberOfFriends);
        (await getFriends.makeRequest(FriendshipStatus.ACCEPTED, {
            "Authorization": "Bearer " + testData.user.fullAccessToken
        })).assertSuccess(testData.friends.map(friendData => ({
            id: friendData.id,
            username: friendData.username,
            firstName: friendData.firstName,
            lastName: friendData.lastName,
            dateOfBirth: friendData.dateOfBirth,
        })));

    });

    it('Get REQUESTED friends returns received friend requests', async () => {

        const numberOfFriends = Math.floor(Math.random() * 4) + 1;
        const testData = await UniqueTestDataSetup.createUserThatHasReceivedNFriendRequests(numberOfFriends);
        (await getFriends.makeRequest(FriendshipStatus.REQUESTED, {
            "Authorization": "Bearer " + testData.user.fullAccessToken
        })).assertSuccess(testData.pendingFriends.map(friendData => ({
            id: friendData.id,
            username: friendData.username,
            firstName: friendData.firstName,
            lastName: friendData.lastName,
            dateOfBirth: friendData.dateOfBirth,
        })));

    });

    it('Get REQUESTED friends does not return sent friend requests', async () => {

        const numberOfFriends = Math.floor(Math.random() * 4) + 1;
        const testData = await UniqueTestDataSetup.createUserThatHasSentNFriendRequests(numberOfFriends);
        (await getFriends.makeRequest(FriendshipStatus.REQUESTED, {
            "Authorization": "Bearer " + testData.user.fullAccessToken
        })).assertSuccess([]);

    });

    it('Get ACCEPTED friends does not return friend requests', async () => {

        const numberOfFriends = Math.floor(Math.random() * 4) + 1;
        const testData = await UniqueTestDataSetup.createUserThatHasReceivedNFriendRequests(numberOfFriends);
        (await getFriends.makeRequest(FriendshipStatus.ACCEPTED, {
            "Authorization": "Bearer " + testData.user.fullAccessToken
        })).assertSuccess([]);

    });

    it('Get REQUESTED friends does not return accepted friends', async () => {

        const numberOfFriends = Math.floor(Math.random() * 4) + 1;
        const testData = await UniqueTestDataSetup.createUserWithNFriends(numberOfFriends);
        (await getFriends.makeRequest(FriendshipStatus.REQUESTED, {
            "Authorization": "Bearer " + testData.user.fullAccessToken
        })).assertSuccess([]);

    });

    it('Get ACCEPTED returns friends and not friend requests', async () => {

        const testData = await UniqueTestDataSetup.createUserWithFriendAndReceivedFriendRequest();
        (await getFriends.makeRequest(FriendshipStatus.ACCEPTED, {
            "Authorization": "Bearer " + testData.user.fullAccessToken
        })).assertSuccess([testData.friend].map(friendData => ({
            id: friendData.id,
            username: friendData.username,
            firstName: friendData.firstName,
            lastName: friendData.lastName,
            dateOfBirth: friendData.dateOfBirth,
        })));

    });

    it('Get REQUESTED returns friend requests and not friends', async () => {

        const testData = await UniqueTestDataSetup.createUserWithFriendAndReceivedFriendRequest();
        (await getFriends.makeRequest(FriendshipStatus.REQUESTED, {
            "Authorization": "Bearer " + testData.user.fullAccessToken
        })).assertSuccess([testData.pendingFriend].map(friendData => ({
            id: friendData.id,
            username: friendData.username,
            firstName: friendData.firstName,
            lastName: friendData.lastName,
            dateOfBirth: friendData.dateOfBirth,
        })));

    });

    it('Cannot get friends with initial access token', async () => {

        const testData = await UniqueTestDataSetup.createUserWithFriendAndReceivedFriendRequest();

        (await getFriends.makeRequest(FriendshipStatus.ACCEPTED, {
            "Authorization": "Bearer " + testData.user.initialAccessToken
        })).assertForbbidenError();

        (await getFriends.makeRequest(FriendshipStatus.REQUESTED, {
            "Authorization": "Bearer " + testData.user.initialAccessToken
        })).assertForbbidenError();

    });

    it('Cannot get friends without full access token', async () => {

        (await getFriends.makeRequest(FriendshipStatus.ACCEPTED, {
            "Authorization": "Bearer "
        })).assertUnauthorizedError();

        (await getFriends.makeRequest(FriendshipStatus.ACCEPTED, {
            "Authorization": "Bearer a.b.c"
        })).assertUnauthorizedError();

        (await getFriends.makeRequest(FriendshipStatus.ACCEPTED, {
            "Origin": "server"
        })).assertUnauthorizedError();

        (await getFriends.makeRequest(FriendshipStatus.REQUESTED, {
            "Authorization": "Bearer "
        })).assertUnauthorizedError();

        (await getFriends.makeRequest(FriendshipStatus.REQUESTED, {
            "Authorization": "Bearer a.b.c"
        })).assertUnauthorizedError();

        (await getFriends.makeRequest(FriendshipStatus.REQUESTED, {
            "Origin": "server"
        })).assertUnauthorizedError();

    })

    it('Get friends return validation error for unexpected status parameter', async () => {

        const user = await UniqueTestDataSetup.createUserWithFullAccessToken();
        // @ts-ignore
        (await getFriends.makeRequest("unknownStatus", {
            "Authorization": "Bearer " + user.fullAccessToken
        })).assertValidationError()

    });

});