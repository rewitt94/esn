import dotenv from "dotenv";
import { TestDataSetup } from "../../../src/utils/TestDataSetup";
import { SendMembership } from "../../../src/endpoints/communities/SendMembership";

describe("Create Community", () => {

    const sendMembership = new SendMembership();

    beforeAll(() => {
        dotenv.config();
    });

    it("Admin can send memberships to friends", async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunityAndNonMember();
        const payload = {
            community: testData.community.id,
            invitees: [testData.nonMember.id]
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
        })).assertSuccess();

    });

    it("Sending membership sends expected notification", async () => {

        throw new Error('test not written');

    });

});
