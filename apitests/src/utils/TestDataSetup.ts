import { v4 as uuid } from "uuid";
import faker from "faker";
import { CreateUser } from "../endpoints/users/CreateUser";
import { Login } from "../endpoints/users/Login";
import { EditUser } from "../endpoints/users/EditUser";
import { Token } from "../endpoints/users/Token";
import { AddFriend } from "../endpoints/users/AddFriend";
import { AcceptFriend } from "../endpoints/users/AcceptFriend";
import { FriendshipStatus } from "../enums/FriendshipStatus";

const createUser = new CreateUser();
const login = new Login();
const editUser = new EditUser();
const token = new Token();
const addFriend = new AddFriend();
const acceptFriend = new AcceptFriend();

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
        const tokenResponse = await tokenAttempt.assertSuccess();
        return Object.assign(userWithFullDetails, {
            fullAccessToken: tokenResponse.accessToken
        });
    };

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
    
}