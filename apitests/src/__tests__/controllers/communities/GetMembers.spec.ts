import dotenv from "dotenv";
import { UniqueTestDataSetup } from "../../../testdata/UniqueTestDataSetup";
import { GetMembers } from "../../../endpoints/communities/GetMembers";
import { MembershipStatus } from "../../../models/enums/MembershipStatus";

describe("Get Communities", () => {

    const getMembers = new GetMembers();

    beforeAll(() => {
        dotenv.config();
    });

    it("Get members returns admin when only member", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunity();
        (await getMembers.makeRequest(testData.community.id, {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertSuccess([
            {
                id: testData.admin.id,
                firstName: testData.admin.firstName,
                lastName: testData.admin.lastName,
                membership: MembershipStatus.ADMIN
            }
        ])

    });

    it("Get members returns admin and members", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAndWithAdminAndMember();
        const communityMembers = [
            {
                id: testData.admin.id,
                firstName: testData.admin.firstName,
                lastName: testData.admin.lastName,
                membership: MembershipStatus.ADMIN
            },
            {
                id: testData.member.id,
                firstName: testData.member.firstName,
                lastName: testData.member.lastName,
                membership: MembershipStatus.MEMBER
            }
        ];
        (await getMembers.makeRequest(testData.community.id, {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertSuccess(communityMembers);
        (await getMembers.makeRequest(testData.community.id, {
            "Authorization": "Bearer " + testData.member.fullAccessToken
        })).assertSuccess(communityMembers);

    });

    it("Get members is not accessible to non members", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunityAndNonMember();
        (await getMembers.makeRequest(testData.community.id, {
            "Authorization": "Bearer " + testData.nonMember.fullAccessToken
        })).assertForbbidenError()

    });

    it("Get members is not accessible with an initial access token", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunity();
        (await getMembers.makeRequest(testData.community.id, {
            "Authorization": "Bearer " + testData.admin.initialAccessToken
        })).assertForbbidenError()

    });

    it("Get members is not accessible without an access token", async () => {

        const testData = await UniqueTestDataSetup.createCommunityAdminAndCommunity();
        (await getMembers.makeRequest(testData.community.id, {
            "Authorization": "Bearer not.actual.token"
        })).assertUnauthorizedError();
        (await getMembers.makeRequest(testData.community.id, {
            "Origin": "apitest"
        })).assertUnauthorizedError();

    });

});