import dotenv from "dotenv";
import { UniqueTestDataSetup } from "../../../testdata/UniqueTestDataSetup";
import { GetCommunity } from "../../../endpoints/communities/GetCommunity";

describe("Get Community", () => {

    const getCommunity = new GetCommunity();

    beforeAll(() => {
        dotenv.config();
    });

    it("Admin can get community", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunity();
        (await getCommunity.makeRequest(testData.community.id,  {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertSuccess({
            id: testData.community.id,
            name: testData.community.name,
            communityType: testData.community.communityType,
        });

    });

    it('Member (Non-Admin) of a community can get community', async () => {

        const testData = await UniqueTestDataSetup.createCommunityAndWithAdminAndMember();
        (await getCommunity.makeRequest(testData.community.id,  {
            "Authorization": "Bearer " + testData.member.fullAccessToken
        })).assertSuccess({
            id: testData.community.id,
            name: testData.community.name,
            communityType: testData.community.communityType,
        });

    });

    it("Get community returns latest community details", async () => {

        const testData = await UniqueTestDataSetup.createCommunityWithAdminAndEditCommunity();
        (await getCommunity.makeRequest(testData.community.id,  {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertSuccess({
            id: testData.community.id,
            name: testData.community.name,
            communityType: testData.community.communityType,
        });

    });

    it('Non-Member without membership of a community cannot get community', async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndNonMember();
        (await getCommunity.makeRequest(testData.community.id, {
            "Authorization": "Bearer " + testData.nonMember.fullAccessToken
        })).assertForbbidenError();

    });

    it('Cannot get community with initial access token', async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunity();
        (await getCommunity.makeRequest(testData.community.id, {
            "Authorization": "Bearer " + testData.admin.initialAccessToken
        })).assertForbbidenError();

    });

    it('Cannot get community without access token', async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunity();
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

        const testData = await UniqueTestDataSetup.createUserWithFullAccessToken();
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