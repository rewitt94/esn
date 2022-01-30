import dotenv from "dotenv";
import { SendEventInvites } from "../../../endpoints/events/SendEventInvites";
import { UniqueTestDataSetup } from "../../../testdata/UniqueTestDataSetup";

describe("Create Invite Event", () => {

    const sendEventInvites = new SendEventInvites();

    beforeAll(() => {
        dotenv.config();
    });

    it("Can invite friends to existing event if event creator", async () => {

        const testData = await UniqueTestDataSetup.createUserWithFriendAndEventWithoutInvitees();
        const sendEventInvitesPayload = {
            event: testData.event.id,
            invitees: [testData.friend.id]
        };
        (await sendEventInvites.makeRequest(sendEventInvitesPayload,  {
            "Authorization": "Bearer " + testData.user.fullAccessToken
        })).assertSuccess();

    });

    // it("Cannot invite friends to event if not event creator", async () => {

    //     const testData = await UniqueTestDataSetup.createUserAndEventWithoutInvitees();
    //     const sendEventInvitesPayload = {
    //         event: testData.event.id

    //     };
    //     (await sendEventInvites.makeRequest(sendEventInvitesPayload,  {
    //         "Authorization": "Bearer " + testData.user.fullAccessToken
    //     })).assertSuccess();

    // });

});