import dotenv from "dotenv";
import { TestDataSetup } from "../../../utils/TestDataSetup";
import { SendMembership } from "../../../endpoints/communities/SendMembership";

describe("Send Membership", () => {

    const sendMembership = new SendMembership();

    beforeAll(() => {
        dotenv.config();
    });

    it("Admin can send memberships to friends", async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunityAndNonMemberFriend();
        const payload = {
            community: testData.community.id,
            invitees: [testData.nonMemberFriend.id]
        };
        (await sendMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertSuccess();

    });

    it("Admin cannot send memberships to non-friends", async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunityAndNonMember();
        const payload = {
            community: testData.community.id,
            invitees: [testData.nonMember.id]
        };
        (await sendMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertForbbidenError();

    });

    it("Member (Non-Admin) of a community cannot send memberships to friends", async () => {

        await new Promise((_, rej) => rej(new Error('test not written')));
        // const testData = await TestDataSetup.createCommunityAdminAndCommunityAndMemberWithNonMemberFriend();
        // const payload = {
        //     community: testData.community.id,
        //     invitees: [testData.nonMemberFriend.id]
        // };
        // (await sendMembership.makeRequest(payload,  {
        //     "Authorization": "Bearer " + testData.memberWithNonMemberFriend.fullAccessToken
        // })).assertForbbidenError();

    });


    it("Member (Non-Admin) of a community cannot send memberships non-friends", async () => {

        await new Promise((_, rej) => rej(new Error('test not written')));
        // const testData = await TestDataSetup.createCommunityAdminAndCommunityAndMemberWithNonMemberFriend();
        // const payload = {
        //     community: testData.community.id,
        //     invitees: [testData.nonMemberFriend.id]
        // };
        // (await sendMembership.makeRequest(payload,  {
        //     "Authorization": "Bearer " + testData.memberWithNonMemberFriend.fullAccessToken
        // })).assertForbbidenError();

    });

    it("Cannot send membership with initial access token", async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunityAndNonMemberFriend();
        const payload = {
            community: testData.community.id,
            invitees: [testData.nonMemberFriend.id]
        };
        (await sendMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.admin.initialAccessToken
        })).assertForbbidenError();

    });

    it("Cannot send membership with without access token", async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunityAndNonMemberFriend();
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

        const testData = await TestDataSetup.createCommunityAdminAndCommunityAndNonMemberFriend();
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

        await new Promise((_, rej) => rej(new Error('test not written')));

    });

});
