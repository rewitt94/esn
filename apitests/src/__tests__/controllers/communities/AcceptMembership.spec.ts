import dotenv from "dotenv";
import { TestDataSetup } from "../../../utils/TestDataSetup";
import { AcceptMembership } from "../../../endpoints/communities/AcceptMembership";

describe("Accept Membership", () => {

    const acceptMembership = new AcceptMembership();

    beforeAll(() => {
        dotenv.config();
    });

    it("User with membership invite can join community", async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunityAndFriendWithCommunityInvite();
        const payload = {
            community: testData.community.id,
        };
        (await acceptMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.friendWithCommunityInvite.fullAccessToken
        })).assertSuccess();

    });

    it("Friend of Admin without membership invite cannot join community", async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunityAndNonMemberFriend();
        const payload = {
            community: testData.community.id,
        };
        (await acceptMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.nonMemberFriend.fullAccessToken
        })).assertForbbidenError();

    });

    it("Non member without membership invite cannot join community", async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunityAndNonMember();
        const payload = {
            community: testData.community.id,
        };
        (await acceptMembership.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.nonMember.fullAccessToken
        })).assertForbbidenError();

    });

    it('Accepting membership invite sends expected notifications', async () => {

        await new Promise((_, rej) => rej(new Error('test not written')));

    });


});