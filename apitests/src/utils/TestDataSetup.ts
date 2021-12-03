import { uuid } from "uuidv4";
import faker from "faker";
import { CreateUser } from "../endpoints/users/CreateUser";
import { Login } from "../endpoints/users/Login";
import { EditUser } from "../endpoints/users/EditUser";
import { Token } from "../endpoints/users/Token";
import { AddFriend } from "../endpoints/users/AddFriend";
import { AcceptFriend } from "../endpoints/users/AcceptFriend";
import { FriendshipStatusEnum } from "../enums/FriendshipStatusEnum";

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
        const payload = { username, password };
        (await createUser.makeRequest(payload, {})).assertSuccess();
        return payload
    }

    static async createUserAndLogin() {
        const username = uuid()
        const password = "mysecretpassword123";
        const authPayload = { username, password };
        const createUserAttempt = await createUser.makeRequest(authPayload, {});
        const createUserResponse = createUserAttempt.assertSuccess();
        const loginAttempt = await login.makeRequest(authPayload, {})
        const response = loginAttempt.assertSuccess();
        return {
            id: createUserResponse.id,
            username,
            password,
            initialAccessToken: response.accessToken
        };
    }

    static async createUserLoginAndAddDetails() {
        const username = uuid()
        const password = "mysecretpassword123";
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const dateOfBirth = faker.date.past(25).toISOString();
        const authPayload = { username, password };
        const createUserAttempt = await createUser.makeRequest(authPayload, {});
        const createUserResponse = createUserAttempt.assertSuccess();
        const loginAttempt = await login.makeRequest(authPayload, {})
        const loginResponse = loginAttempt.assertSuccess();
        (await editUser.makeRequest({
            firstName,
            lastName,
            dateOfBirth
        }, {
            "Authorization": "Bearer " + loginResponse.accessToken
        })).assertSuccess();
        return {
            id: createUserResponse.id,
            username,
            password,
            firstName,
            lastName,
            dateOfBirth,
            initialAccessToken: loginResponse.accessToken,
        }
    }

    static async createUserWithFullAccessToken() {
        const username = uuid()
        const password = "mysecretpassword123";
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const dateOfBirth = faker.date.past(25).toISOString();
        const authPayload = { username, password };
        const createUserAttempt = await createUser.makeRequest(authPayload, {});
        const createUserResponse = createUserAttempt.assertSuccess();
        const loginAttempt = await login.makeRequest(authPayload, {})
        const loginResponse = loginAttempt.assertSuccess();
        const editUserResponse = await editUser.makeRequest({
            firstName,
            lastName,
            dateOfBirth
        }, {
            "Authorization": "Bearer " + loginResponse.accessToken
        });
        editUserResponse.assertSuccess();
        const tokenAttempt = await token.makeRequest(undefined, {
            "Authorization": "Bearer " + loginResponse.accessToken
        })
        const tokenResponse = await tokenAttempt.assertSuccess();
        return {
            id: createUserResponse.id,
            username,
            password,
            firstName,
            lastName,
            dateOfBirth,
            initialAccessToken: loginResponse.accessToken,
            fullAccessToken: tokenResponse.accessToken
        };
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
        (await acceptFriend.makeRequest({ username: user.username, status: FriendshipStatusEnum.ACCEPTED }, { "Authorization": "Bearer " + otherUser.fullAccessToken })).assertSuccess();
        return { user, otherUser };
    }


}