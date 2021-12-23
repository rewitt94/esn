import { v4 as uuid } from "uuid";
import faker from "faker";
import { CreateUser } from "../endpoints/users/CreateUser";
import { Login } from "../endpoints/users/Login";
import { EditUser } from "../endpoints/users/EditUser";
import { Token } from "../endpoints/users/Token";
import { AddFriend } from "../endpoints/users/AddFriend";
import { AcceptFriend } from "../endpoints/users/AcceptFriend";
import { FriendshipStatus } from "../enums/FriendshipStatus";
import { CreateCommunity } from "../endpoints/communities/CreateCommunity";
import { CommunityType } from "../enums/CommunityType";
import { EditCommunity } from "../endpoints/communities/EditCommunity";
import { SendMembership } from "../endpoints/communities/SendMembership";

const createUser = new CreateUser();
const login = new Login();
const editUser = new EditUser();
const token = new Token();
const addFriend = new AddFriend();
const acceptFriend = new AcceptFriend();
const createCommunity = new CreateCommunity();
const editCommunity = new EditCommunity();
const sendMembership = new SendMembership();

export class TestDataSetup {

    static async createUser() {
        const username = uuid()
        const password = "mysecretpassword123";
        const authPayload = { username, password };
        const createUserAttempt = await createUser.makeRequest(authPayload, {});
        const createUserResponse = createUserAttempt.assertSuccess();
        return {
            id: createUserResponse.id,
            username,
            password,
        }
    }

    static async createUserAndLogin() {
        const createdUser = await this.createUser()
        const loginAttempt = await login.makeRequest({
            username: createdUser.username,
            password: createdUser.password,
        }, {})
        const loginResponse = loginAttempt.assertSuccess();
        return Object.assign(createdUser, {
            initialAccessToken: loginResponse.accessToken
        })
    }

    static async createUserLoginAndAddDetails() {
        const userAndInitialLogin = await this.createUserAndLogin();
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const dateOfBirth = faker.date.past(25).toISOString();
        (await editUser.makeRequest({
            firstName,
            lastName,
            dateOfBirth
        }, {
            "Authorization": "Bearer " + userAndInitialLogin.initialAccessToken
        })).assertSuccess();
        return Object.assign(userAndInitialLogin, {
            firstName,
            lastName,
            dateOfBirth,
        });
    }

    static async createUserWithFullAccessToken() {
        const userWithFullDetails = await this.createUserLoginAndAddDetails();
        const tokenAttempt = await token.makeRequest(undefined, {
            "Authorization": "Bearer " + userWithFullDetails.initialAccessToken
        })
        const tokenResponse = tokenAttempt.assertSuccess();
        return Object.assign(userWithFullDetails, {
            fullAccessToken: tokenResponse.accessToken
        });
    }

    static async createUserWithPendingFriendRequest() {
        const user = await this.createUserWithFullAccessToken();
        const otherUser = await this.createUserWithFullAccessToken();
        (await addFriend.makeRequest({ username: user.username }, { "Authorization": "Bearer " + otherUser.fullAccessToken })).assertSuccess();
        return { user, otherUser };
    }

    static async createUsersWhoAreFriends() {
        const user = await this.createUserWithFullAccessToken();
        const otherUser = await this.createUserWithFullAccessToken();
        (await addFriend.makeRequest({ username: otherUser.username }, { "Authorization": "Bearer " + user.fullAccessToken })).assertSuccess();
        (await acceptFriend.makeRequest({ username: user.username, status: FriendshipStatus.ACCEPTED }, { "Authorization": "Bearer " + otherUser.fullAccessToken })).assertSuccess();
        return { user, otherUser };
    }

    static async createUserWithNFriends(n: number) {
        const user = await this.createUserWithFullAccessToken();
        const friends = [];
        for (let i = 0; i <= n; i++) {
            const friend = await this.createUserWithFullAccessToken();
            (await addFriend.makeRequest({ username: friend.username }, { "Authorization": "Bearer " + user.fullAccessToken })).assertSuccess();
            (await acceptFriend.makeRequest({ username: user.username, status: FriendshipStatus.ACCEPTED }, { "Authorization": "Bearer " + friend.fullAccessToken })).assertSuccess();
            friends.push(friend)
        }
        return { user, friends }
    }

    static async createUserThatHasReceivedNFriendRequests(n: number) {
        const user = await this.createUserWithFullAccessToken();
        const pendingFriends = [];
        for (let i = 0; i <= n; i++) {
            const pendingFriend = await this.createUserWithFullAccessToken();
            (await addFriend.makeRequest({ username: user.username }, { "Authorization": "Bearer " + pendingFriend.fullAccessToken })).assertSuccess();
            pendingFriends.push(pendingFriend)
        }
        return { user, pendingFriends }
    }

    static async createUserThatHasSentNFriendRequests(n: number) {
        const user = await this.createUserWithFullAccessToken();
        const pendingFriends = [];
        for (let i = 0; i <= n; i++) {
            const pendingFriend = await this.createUserWithFullAccessToken();
            (await addFriend.makeRequest({ username: pendingFriend.username }, { "Authorization": "Bearer " + user.fullAccessToken })).assertSuccess();
            pendingFriends.push(pendingFriend)
        }
        return { user, pendingFriends }
    }

    static async createUserWithFriendAndReceivedFriendRequest() {
        const user = await this.createUserWithFullAccessToken();
        const friend = await this.createUserWithFullAccessToken();
        (await addFriend.makeRequest({ username: friend.username }, { "Authorization": "Bearer " + user.fullAccessToken })).assertSuccess();
        (await acceptFriend.makeRequest({ username: user.username, status: FriendshipStatus.ACCEPTED }, { "Authorization": "Bearer " + friend.fullAccessToken })).assertSuccess();
        const pendingFriend = await this.createUserWithFullAccessToken();
        (await addFriend.makeRequest({ username: user.username }, { "Authorization": "Bearer " + pendingFriend.fullAccessToken })).assertSuccess();
        return { user, friend, pendingFriend };
    }


    static async createCommunityAdminAndCommunity() {
        const admin = await this.createUserWithFullAccessToken();
        const name = faker.company.companyName();
        const communityType = [CommunityType.FRIENDS, CommunityType.WORK, CommunityType.SPORTS][Math.floor(Math.random() * 3)]
        const createCommunityResponse = await createCommunity.makeRequest({ name, communityType }, { "Authorization": "Bearer " + admin.fullAccessToken });
        const community = createCommunityResponse.assertSuccess();
        return {
            admin,
            community
        }
    }

    static async createCommunityWithAdminAndEditCommunity() {
        const admin = await this.createUserWithFullAccessToken();
        const name = faker.company.companyName();
        const communityType = [CommunityType.FRIENDS, CommunityType.WORK, CommunityType.SPORTS][Math.floor(Math.random() * 3)]
        const createCommunityResponse = await createCommunity.makeRequest({ name, communityType }, { "Authorization": "Bearer " + admin.fullAccessToken });
        const initialCommunity = createCommunityResponse.assertSuccess();
        const editCommunityPayload = {
            id: initialCommunity.id,
            name: faker.company.companyName(),
            communityType: [CommunityType.FRIENDS, CommunityType.WORK, CommunityType.SPORTS][Math.floor(Math.random() * 3)]
        };
        const editCommunityResponse = await editCommunity.makeRequest(editCommunityPayload, { "Authorization": "Bearer " + admin.fullAccessToken });
        const community = editCommunityResponse.assertSuccess();
        return {
            admin,
            community
        }
    }

    static async createCommunityAdminAndCommunityAndNonMember() {
        const testData = await this.createCommunityAdminAndCommunity()
        const nonMember = await this.createUserWithFullAccessToken();
        return Object.assign(testData, { nonMember });
    }

    static async createCommunityAdminAndCommunityAndNonMemberFriend() {
        const testData = await this.createCommunityAdminAndCommunity()
        const nonMemberFriend = await this.createUserWithFullAccessToken();
        (await addFriend.makeRequest({ username: nonMemberFriend.username }, { "Authorization": "Bearer " + testData.admin.fullAccessToken })).assertSuccess();
        (await acceptFriend.makeRequest({ username: testData.admin.username, status: FriendshipStatus.ACCEPTED }, { "Authorization": "Bearer " + nonMemberFriend.fullAccessToken })).assertSuccess();
        return Object.assign(testData, { nonMemberFriend });
    }

    static async createCommunityAdminAndCommunityAndNNonMembers(n: number) {
        const testData = await this.createCommunityAdminAndCommunity()
        const nonMembers = [];
        for (let i = 0; i <= n; i++) {
            nonMembers.push(await this.createUserWithFullAccessToken());
        }
        return Object.assign(testData, { nonMembers });

    }

    static async createCommunityAdminAndCommunityAndMemberWithNonMemberFriend() {
        const testData = await this.createCommunityAdminAndCommunity()
        const memberWithNonMemberFriend = await this.createUserWithFullAccessToken();
        const nonMemberFriend = await this.createUserWithFullAccessToken();
        (await addFriend.makeRequest({ username: memberWithNonMemberFriend.username }, { "Authorization": "Bearer " + nonMemberFriend.fullAccessToken })).assertSuccess();
        (await acceptFriend.makeRequest({ username: nonMemberFriend.username, status: FriendshipStatus.ACCEPTED }, { "Authorization": "Bearer " + memberWithNonMemberFriend.fullAccessToken })).assertSuccess();
        return Object.assign(testData, { memberWithNonMemberFriend, nonMemberFriend });
    }

    static async createCommunityAdminAndCommunityAndFriendWithCommunityInvite() {
        const testData = await this.createCommunityAdminAndCommunityAndNonMemberFriend();
        const sendMembershipPayload = {
            community: testData.community.id,
            invitees: [testData.nonMemberFriend.id]
        };
        (await sendMembership.makeRequest(sendMembershipPayload, { "Authorization": "Bearer " + testData.admin.fullAccessToken })).assertSuccess();
        return {
            admin: testData.admin,
            community: testData.community,
            friendWithCommunityInvite: testData.nonMemberFriend
        }
    }

}