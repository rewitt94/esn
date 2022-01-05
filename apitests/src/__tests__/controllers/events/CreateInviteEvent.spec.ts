import faker from "faker";
import dotenv from "dotenv";
import { DateTime } from "luxon";
import { UniqueTestDataSetup } from "../../../testdata/UniqueTestDataSetup";
import { CreateInviteEvent } from "../../../endpoints/events/CreateInviteEvent";
import { GetNotifications } from "../../../endpoints/notifications/GetNotifications";
import { NotificationType } from "../../../models/enums/NotificationType";

describe("Create Invite Event", () => {

    const createInviteEvent = new CreateInviteEvent();
    const getNotifications = new GetNotifications();

    beforeAll(() => {
        dotenv.config();
    });

    it("Can create invite event without inviting friends", async () => {

        const testData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const createEventPayload = {
            name: faker.address.city() + " Gathering",
            description: faker.company.bsAdjective(),
            startTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 5 }).toISO(),
            endTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 1 }).toISO(),
        };
        (await createInviteEvent.makeRequest(createEventPayload,  {
            "Authorization": "Bearer " + testData.fullAccessToken
        })).assertSuccess();

    });

    it("Can create invite event while inviting friends", async () => {

        const numberOfFriends = Math.floor(Math.random() * 4) + 1;
        const testData = await UniqueTestDataSetup.createUserWithNFriends(numberOfFriends);
        const createEventPayload = {
            name: faker.address.city() + " Gathering",
            description: faker.company.bsAdjective(),
            startTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 5 }).toISO(),
            endTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 1 }).toISO(),
            invitees: testData.friends.map(friend => friend.id)
        };
        (await createInviteEvent.makeRequest(createEventPayload,  {
            "Authorization": "Bearer " + testData.user.fullAccessToken
        })).assertSuccess();

    });

    it("Cannot create invite event and invite users that are not friends", async () => {

        const user = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const nonFriend = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const createEventPayload = {
            name: faker.address.city() + " Gathering",
            description: faker.company.bsAdjective(),
            startTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 5 }).toISO(),
            endTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 1 }).toISO(),
            invitees: [nonFriend.id]
        };
        (await createInviteEvent.makeRequest(createEventPayload,  {
            "Authorization": "Bearer " + user.fullAccessToken
        })).assertForbbidenError();

    });

    it("Cannot create invite event without an access token", async () => {

        const createEventPayload = {
            name: faker.address.city() + " Gathering",
            description: faker.company.bsAdjective(),
            startTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 5 }).toISO(),
            endTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 1 }).toISO(),
        };
        (await createInviteEvent.makeRequest(createEventPayload,  {
            "Authorization": "Bearer not.a.token"
        })).assertUnauthorizedError();
        (await createInviteEvent.makeRequest(createEventPayload,  {
            "token": "here"
        })).assertUnauthorizedError();

    });

    it("Cannot create invite with an inital access token", async () => {

        const user = await UniqueTestDataSetup.createUserAndLogin();
        const createEventPayload = {
            name: faker.address.city() + " Gathering",
            description: faker.company.bsAdjective(),
            startTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 5 }).toISO(),
            endTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 1 }).toISO(),
        };
        (await createInviteEvent.makeRequest(createEventPayload,  {
            "Authorization": "Bearer " + user.initialAccessToken
        })).assertForbbidenError();

    });

    it("Cannot create invite event with an invalid payload", async () => {

        const testData = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const invalidAttemps = [
            1,
            {
                name: faker.address.city() + " Gathering",
                description: faker.company.bsAdjective(),
                startTime: 'not a date',
                endTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 1 }).toISO(),
            },
            {
                name: faker.address.city() + " Gathering",
                description: faker.company.bsAdjective(),
                startTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 5 }).toISO(),
                endTime: 'not a date',
            }
        ];
        for (const attempt of invalidAttemps) {
            // @ts-ignore
            (await createInviteEvent.makeRequest(attempt,  {
                "Authorization": "Bearer " + testData.fullAccessToken
            })).assertValidationError();
        };

    });

    it("Cannot create invite event and if any of the invitees are not friends", async () => {

        const testData = await UniqueTestDataSetup.createUsersWhoAreFriends();
        const nonFriend = await UniqueTestDataSetup.createUserWithFullAccessToken();
        const createEventPayload = {
            name: faker.address.city() + " Gathering",
            description: faker.company.bsAdjective(),
            startTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 5 }).toISO(),
            endTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 1 }).toISO(),
            invitees: [testData.otherUser.id, nonFriend.id]
        };
        (await createInviteEvent.makeRequest(createEventPayload,  {
            "Authorization": "Bearer " + testData.user.fullAccessToken
        })).assertForbbidenError();

    });

    it("Can invited friends receive notifications", async () => {

        const numberOfFriends = Math.floor(Math.random() * 4) + 1;
        const testData = await UniqueTestDataSetup.createUserWithNFriends(numberOfFriends);
        const createEventPayload = {
            name: faker.address.city() + " Gathering",
            description: faker.company.bsAdjective(),
            startTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 5 }).toISO(),
            endTime: DateTime.now().plus({ weeks: 1 }).endOf("day").minus({ hours: 1 }).toISO(),
            invitees: testData.friends.map(friend => friend.id)
        };
        const createInviteEventResponse = await createInviteEvent.makeRequest(createEventPayload,  {
            "Authorization": "Bearer " + testData.user.fullAccessToken
        });
        const event = createInviteEventResponse.assertSuccess();
        for (const friend of testData.friends) {
            (await getNotifications.makeRequest(undefined,  {
                "Authorization": "Bearer " + friend.fullAccessToken
            })).assertSuccess([
                {
                    notificationType: NotificationType.FRIEND_REQUEST_RECEIVED,
                    receiverId: friend.id,
                    senderId: testData.user.id,
                    subjectId: null
                },
                {
                    notificationType: NotificationType.EVENT_INVITE_RECEIVED,
                    receiverId: friend.id,
                    senderId: testData.user.id,
                    subjectId: event.id
                }
            ]);
        };

    });



});