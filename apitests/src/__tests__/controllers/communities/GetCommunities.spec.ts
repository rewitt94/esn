import dotenv from "dotenv";
import { UniqueTestDataSetup } from "../../../testdata/UniqueTestDataSetup";
import { GetCommunities } from "../../../endpoints/communities/GetCommunities";

describe("Get Communities", () => {

    const getCommunities = new GetCommunities();

    beforeAll(() => {
        dotenv.config();
    });

    it("Get communities returns empty array if user has no communities", async () => {

        const user = await UniqueTestDataSetup.createUserWithFullAccessToken();
        (await getCommunities.makeRequest(undefined, {
            "Authorization": "Bearer " + user.fullAccessToken
        })).assertSuccess([])

    })

    it("Get communities returns one community if user has one community", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAndWithAdminAndMember();

        (await getCommunities.makeRequest(undefined, {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertSuccess([testData.community]);

        (await getCommunities.makeRequest(undefined, {
            "Authorization": "Bearer " + testData.member.fullAccessToken
        })).assertSuccess([testData.community]);

    });

    it("Get communities returns multiplie communities if user has multiplie communities", async () => {

        const numberOfCommunities = Math.floor(Math.random() * 4) + 1;
        const testData = await UniqueTestDataSetup.createNCommunitiesForAdminAndMember(numberOfCommunities);

        (await getCommunities.makeRequest(undefined, {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertSuccess(testData.communities);

        (await getCommunities.makeRequest(undefined, {
            "Authorization": "Bearer " + testData.member.fullAccessToken
        })).assertSuccess(testData.communities);

    });

    it("Get communities cannot be called with initial access token", async () => {

        const user = await UniqueTestDataSetup.createUserAndLogin();
        (await getCommunities.makeRequest(undefined, {
            "Authorization": "Bearer " + user.initialAccessToken
        })).assertForbbidenError();

    });

    it("Get communities cannot be called without access token", async () => {

        (await getCommunities.makeRequest(undefined, {
            "Authorization": "Bearer user.without.token"
        })).assertUnauthorizedError();
        (await getCommunities.makeRequest(undefined, {})).assertUnauthorizedError();

    });

});