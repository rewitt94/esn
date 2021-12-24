import fetch from 'node-fetch';
import { NotificationType } from "../../models/enums/NotificationType"
import { HTTPEndpoint, HTTPApiMethodResponse } from "../HTTPAssertions";

interface Notification {
    id: string;
    dateCreated: string;
    notificationType: NotificationType;
    receiverId: string;
    senderId: string;
    subjectId?: string;
}

interface NotificationValidationData {
    notificationType: NotificationType;
    receiverId: string;
    senderId: string;
    subjectId: string | null;
}

export class GetNotifications extends HTTPEndpoint<undefined, Notification[], NotificationValidationData[]> {

    httpRequest = async (_: undefined, headers: object): Promise<HTTPApiMethodResponse<Notification[]>> => {
        const response = await fetch(process.env.BASE_URL! + "/notifications", {
            method: "GET",
            headers: Object.assign({
                "Content-Type": "application/json"
            }, headers),
        }).catch((err) => { throw err });
        return {
            statusCode: response.status,
            responseBody: await response.json().catch((err) => { throw err }) as Notification[]
        }
    }

    assertSuccess = (statusCode: number, responseBody: Notification[], _: undefined, validationData: NotificationValidationData[]): void => {
        expect(statusCode).toEqual(200);
        const responseNotificationValidationData = responseBody.map(notification => {
            expect(notification.id).toMatch(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/);
            expect(notification.dateCreated).toMatch(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/);
            return {
                notificationType: notification.notificationType,
                receiverId: notification.receiverId,
                senderId: notification.senderId,
                subjectId: notification.subjectId 
            }
        })
        expect(responseNotificationValidationData).toEqual(validationData);
    }

}