import dotenv from "dotenv";
import { UniqueTestDataSetup } from "../../../testdata/UniqueTestDataSetup";
import { SendMembership } from "../../../endpoints/communities/SendMembership";
import { GetNotifications } from "../../../endpoints/notifications/GetNotifications";
import { NotificationType } from "../../../models/enums/NotificationType";

describe("Send Membership", () => {

    const sendMembership = new SendMembership();
    const getNotifications = new GetNotifications();

    beforeAll(() => {
        dotenv.config();
    });

    it("Admin can send memberships to friends", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndNonMemberFriend();
        const payload = {
            community: testData.community.id,
            invitees: [testData.nonMemberFriend.id]
        };
        (await sendMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertSuccess();

    });

    it("Admin cannot send memberships to non-friends", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndNonMember();
        const payload = {
            community: testData.community.id,
            invitees: [testData.nonMember.id]
        };
        (await sendMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertForbbidenError();

    });

    it("Member (Non-Admin) of a community cannot send memberships to friends", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAndWithAdminAndMemberWithNonMemberFriend();
        const payload = {
            community: testData.community.id,
            invitees: [testData.friendOfMember.id]
        };
        (await sendMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.memberWithNonMemberFriend.fullAccessToken
        })).assertForbbidenError();

    });

    it("Member (Non-Admin) of a community cannot send memberships non-friends", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAndWithAdminAndMemberAndNonConnectedUser();        
        const payload = {
            community: testData.community.id,
            invitees: [testData.nonConnectedUser.id]
        };
        (await sendMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.member.initialAccessToken
        })).assertForbbidenError();

    });

    it("Cannot send membership with initial access token", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndNonMemberFriend();
        const payload = {
            community: testData.community.id,
            invitees: [testData.nonMemberFriend.id]
        };
        (await sendMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.admin.initialAccessToken
        })).assertForbbidenError();

    });

    it("Cannot send membership with without access token", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndNonMemberFriend();
        const payload = {
            community: testData.community.id,
            invitees: [testData.nonMemberFriend.id]
        };
        (await sendMembership.makeRequest(payload, {
            "Authorization": "Bearer my.jwt.token"
        })).assertUnauthorizedError();

        (await sendMembership.makeRequest(payload, {
            "Authorization": ""
        })).assertUnauthorizedError();

        (await sendMembership.makeRequest(payload, {
            "x-api-key": "mykey"
        })).assertUnauthorizedError();

    });

    it("Cannot edit community user due to validation errors", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndNonMemberFriend();
        const invalidAttemps = [
            1,
            'string',
            {
                community: 1,
                invitees: [testData.nonMemberFriend.id]
            },
            {
                community: testData.community.id,
                invitees: testData.nonMemberFriend.id
            },
            {
                community: testData.community.id,
                invitees: 1
            },
            {
                community: 'not a uuid',
                invitees: [testData.nonMemberFriend.id]
            },
            {
                community: 'not a uuid',
                invitees: ['not a uuid']
            }
        ];
        for (const attempt of invalidAttemps) {
            // @ts-ignore
            (await sendMembership.makeRequest(attempt,  {
                "Authorization": "Bearer " + testData.admin.fullAccessToken
            })).assertValidationError();
        }


    });

    it("Sending membership sends expected notification", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndNonMemberFriend();
        const payload = {
            community: testData.community.id,
            invitees: [testData.nonMemberFriend.id]
        };
        (await sendMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertSuccess();
        (await getNotifications.makeRequest(undefined,  {
            "Authorization": "Bearer " + testData.nonMemberFriend.fullAccessToken
        })).assertSuccess([
            {
                notificationType: NotificationType.FRIEND_REQUEST_RECEIVED,
                receiverId: testData.nonMemberFriend.id,
                senderId: testData.admin.id,
                subjectId: null
            },
            {
                notificationType: NotificationType.COMMUNITY_INVITE_RECEIVED,
                receiverId: testData.nonMemberFriend.id,
                senderId: testData.admin.id,
                subjectId: testData.community.id
            }
        ]);
    });

});
