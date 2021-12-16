import dotenv from "dotenv";
import faker from "faker";
import { EditCommunity } from "../../../src/endpoints/communities/EditCommunity";
import { TestDataSetup } from "../../../src/utils/TestDataSetup";
import { CommunityType } from "../../../src/enums/CommunityType";

describe("Edit Community", () => {

    const editCommunity = new EditCommunity();

    beforeAll(() => {
        dotenv.config();
    });


    it("Admin can edit community", async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunity();
        const payload = {
            id: testData.community.id,
            name: faker.company.companyName(),
            communityType: CommunityType.WORK
        };
        (await editCommunity.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertSuccess();

    });

    it("Admin can edit community without community type", async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunity();
        const payload = {
            id: testData.community.id,
            name: faker.company.companyName()
        };
        (await editCommunity.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.admin.fullAccessToken
        })).assertSuccess();

    });

    it('Non-Member of a community cannot edit community', async () => {

        let testData = await TestDataSetup.createCommunityAdminAndCommunityAndNonMember();
        const payload = {
            id: testData.community.id,
            name: faker.company.companyName()
        };
        (await editCommunity.makeRequest(payload,  {
            "Authorization": "Bearer " + testData.nonMember.fullAccessToken
        })).assertForbbidenError();

    });

    it('Member (Non-Admin) of a community cannot edit community', async () => {

        throw new Error('test to be written');
        
    });

    it("Cannot edit community without access token", async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunity();
        const payload = {
            id: testData.community.id,
            name: faker.company.companyName(),
            communityType: CommunityType.WORK
        };

        (await editCommunity.makeRequest(payload,  {
            "Authorization": "Bearer my.jwt.token"
        })).assertUnauthorizedError();

        (await editCommunity.makeRequest(payload,  {
            "Authorization": ""
        })).assertUnauthorizedError();

        (await editCommunity.makeRequest(payload,  {
            "x-api-key": "mykey"
        })).assertUnauthorizedError();

    });

    it("Cannot edit community with initial access token", async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunity();
        (await editCommunity.makeRequest({
            id: testData.community.id,
            name: faker.company.companyName(),
            communityType: CommunityType.WORK
        },  {
            "Authorization": "Bearer " + testData.admin.initialAccessToken
        })).assertForbbidenError();

    });

    it("Cannot edit community user due to validation errors", async () => {

        const testData = await TestDataSetup.createCommunityAdminAndCommunity();
        const invalidAttemps = [
            1,
            {
                id: testData.community.id
            },
            {
                id: testData.community.id,
                name: faker.company.companyName(),
                communityType: "invalid-enum"
            },
            {
                id: testData.community.id,
                name: "123",
            },
            {
                id: testData.community.id,
                name: "a"
            },
            {   
                id: testData.community.id,
                name: "mybigcommunity123mybigcommunity123mybigcommunity123mybigcommunity123mybigcommunity123"
            },
            {
                name: faker.company.companyName(),
            }
        ]
        for (const payload of invalidAttemps) {
            // @ts-ignore
            (await editCommunity.makeRequest(payload,  {
                "Authorization": "Bearer " + testData.admin.fullAccessToken
            })).assertValidationError();
        }

    });

    it('Editting a community sends a notification to members', async () => {
        throw new Error('test to be written');
    });


});