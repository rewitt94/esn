import dotenv from "dotenv";
import { UniqueTestDataSetup } from "../../../testdata/UniqueTestDataSetup";
import { AcceptMembership } from "../../../endpoints/communities/AcceptMembership";
import { GetNotifications } from "../../../endpoints/notifications/GetNotifications";
import { NotificationType } from "../../../models/enums/NotificationType";

describe("Accept Membership", () => {

    const acceptMembership = new AcceptMembership();
    const getNotifications = new GetNotifications();

    beforeAll(() => {
        dotenv.config();
    });

    it("User with membership invite can join community", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndFriendWithCommunityInvite();
        const payload = {
            community: testData.community.id,
        };
        (await acceptMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.friendWithCommunityInvite.fullAccessToken
        })).assertSuccess();

    });

    it("Friend of Admin without membership invite cannot join community", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndNonMemberFriend();
        const payload = {
            community: testData.community.id,
        };
        (await acceptMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.nonMemberFriend.fullAccessToken
        })).assertForbbidenError();

    });

    it("Non member without membership invite cannot join community", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndNonMember();
        const payload = {
            community: testData.community.id,
        };
        (await acceptMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.nonMember.fullAccessToken
        })).assertForbbidenError();

    });

    it("Cannot accept membership with initial access token", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndFriendWithCommunityInvite();
        const payload = {
            community: testData.community.id,
        };
        (await acceptMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.friendWithCommunityInvite.initialAccessToken
        })).assertForbbidenError();

    });


    it("Cannot accept membership without access token", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndFriendWithCommunityInvite();
        const payload = {
            community: testData.community.id,
        };
        (await acceptMembership.makeRequest(payload,  {
            "Authorization": "Bearer invalid.token.header"
        })).assertUnauthorizedError();
        (await acceptMembership.makeRequest(payload,  {
            "x-api-key": "123"
        })).assertUnauthorizedError();
        (await acceptMembership.makeRequest(payload,  {})).assertUnauthorizedError();

    });

    it("Cannot accept membership with invalid payload ", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndFriendWithCommunityInvite();
        const invalidAttempts = [
            undefined,
            ["helloworld",2,3],
            {
                community: 1
            },
            {
                community: "not-a-uuid"
            }
        ];
        for (const invalidAttempt of invalidAttempts) {
            // @ts-ignore
            (await acceptMembership.makeRequest(invalidAttempt,  {
                "Authorization": "Bearer " + testData.friendWithCommunityInvite.fullAccessToken
            })).assertValidationError();
        }

    });

    it('Accepting membership invite sends expected notifications', async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndFriendWithCommunityInvite();
        const payload = {
            community: testData.community.id,
        };
        (await acceptMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.friendWithCommunityInvite.fullAccessToken
        })).assertSuccess();
        (await getNotifications.makeRequest(undefined,  {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertSuccess([
            {
                notificationType: NotificationType.FRIEND_REQUEST_ACCEPTED,
                receiverId: testData.admin.id,
                senderId: testData.friendWithCommunityInvite.id,
                subjectId: null
            },
            {
                notificationType: NotificationType.COMMUNITY_INVITE_ACCEPTED,
                receiverId: testData.admin.id,
                senderId: testData.friendWithCommunityInvite.id,
                subjectId: testData.community.id
            }
        ]);

    });


});