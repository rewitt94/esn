import dotenv from "dotenv";
import { TestDataSetup } from "../../../utils/TestDataSetup";
import { GetCommunity } from "../../../endpoints/communities/GetCommunity";

describe("Get Community", () => {

    const getCommunity = new GetCommunity();

    beforeAll(() => {
        dotenv.config();
    });

    it("Admin can get community", async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunity();
        (await getCommunity.makeRequest(testData.community.id,  {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertSuccess({
            id: testData.community.id,
            name: testData.community.name,
            communityType: testData.community.communityType,
        });

    });

    it('Member (Non-Admin) of a community can get community', async () => {

        await new Promise((_, rej) => rej(new Error('test not written')));

    });

    it("Get community returns latest community details", async () => {

        const testData = await TestDataSetup.createCommunityWithAdminAndEditCommunity();
        (await getCommunity.makeRequest(testData.community.id,  {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertSuccess({
            id: testData.community.id,
            name: testData.community.name,
            communityType: testData.community.communityType,
        });

    });

    it('Non-Member without membership of a community cannot get community', async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunityAndNonMember();
        (await getCommunity.makeRequest(testData.community.id, {
            "Authorization": "Bearer " + testData.nonMember.fullAccessToken
        })).assertForbbidenError();

    });

    it('Cannot get community with initial access token', async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunity();
        (await getCommunity.makeRequest(testData.community.id, {
            "Authorization": "Bearer " + testData.admin.initialAccessToken
        })).assertForbbidenError();

    });

    it('Cannot get community without access token', async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunity();
        (await getCommunity.makeRequest(testData.community.id, {
            "Authorization": "Bearer my.jwt.token"
        })).assertUnauthorizedError();

        (await getCommunity.makeRequest(testData.community.id, {
            "Authorization": ""
        })).assertUnauthorizedError();

        (await getCommunity.makeRequest(testData.community.id, {
            "x-api-key": "mykey"
        })).assertUnauthorizedError();

    });

    it('Get community must send uuid', async () => {

        const testData = await TestDataSetup.createUserWithFullAccessToken();
        // @ts-ignore
        (await getCommunity.makeRequest(1, {
            "Authorization": "Bearer " + testData.fullAccessToken
        })).assertValidationError();
        // @ts-ignore
        (await getCommunity.makeRequest('randomstring', {
            "Authorization": "Bearer " + testData.fullAccessToken
        })).assertValidationError();

    })

});