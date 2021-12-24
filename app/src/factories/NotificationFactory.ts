import { v4 as uuid } from "uuid";
import Notification from "../entities/Notification";
import { NotificationType } from "../enums/NotificationType";

export default class NotificationFactory {

    static makeAddFriendNotification = (inviteeId: string, senderUserId: string): Notification => {
        const notification = new Notification();
        notification.id = uuid();
        notification.notificationType = NotificationType.FRIEND_REQUEST_RECEIVED;
        notification.senderId = senderUserId;
        notification.receiverId = inviteeId;
        return notification;
    };

    static makeAcceptFriendNotification = (inviteeId: string, acceptedUserId: string): Notification => {
        const notification = new Notification();
        notification.id = uuid();
        notification.notificationType = NotificationType.FRIEND_REQUEST_ACCEPTED;
        notification.senderId = inviteeId;
        notification.receiverId = acceptedUserId;
        return notification;
    }

    static makeCommunityInviteNotification = (invitee: string, senderId: string, communityId: string): Notification => {
        const notification = new Notification();
        notification.id = uuid();
        notification.notificationType = NotificationType.COMMUNITY_INVITE_RECEIVED;
        notification.senderId = senderId;
        notification.receiverId = invitee;
        notification.subjectId = communityId;
        return notification;
    }

    static makeAcceptCommunityInviteNotification = (invitee: string, senderId: string, communityId: string): Notification => {
        const notification = new Notification();
        notification.id = uuid();
        notification.notificationType = NotificationType.COMMUNITY_INVITE_ACCEPTED;
        notification.senderId = invitee;
        notification.receiverId = senderId;
        notification.subjectId = communityId;
        return notification;
    }

    static makeCommunityUpdateNotifications = (senderId: string, member: string, communityId: string): Notification => {
        const notification = new Notification();
        notification.id = uuid();
        notification.notificationType = NotificationType.COMMUNITY_EDITTED;
        notification.senderId = senderId;
        notification.receiverId = member;
        notification.subjectId = communityId;
        return notification;
    }

    static makeCommunityEventCreatedNotification = (userId: string, communityId: string, eventId: string): Notification => {
        const notification = new Notification();
        notification.id = uuid();
        notification.notificationType = NotificationType.COMMUNITY_EVENT_CREATED;
        notification.senderId = communityId;
        notification.receiverId = userId;
        notification.subjectId = eventId;
        return notification;
    }

    static makeEventInviteNotification = (invitee: string, senderId: string, eventId: string): Notification => {
        const notification = new Notification();
        notification.id = uuid();
        notification.notificationType = NotificationType.EVENT_INVITE_RECEIVED;
        notification.senderId = senderId;
        notification.receiverId = invitee;
        notification.subjectId = eventId;
        return notification;
    }

    static makeEventAttendanceNotification = (attendee: string, eventCreator: string, eventId: string): Notification => {
        const notification = new Notification();
        notification.id = uuid();
        notification.notificationType = NotificationType.EVENT_ATTENDANCE_UPDATE;
        notification.senderId = attendee;
        notification.receiverId = eventCreator;
        notification.subjectId = eventId;
        return notification;
    }

    static makeEventUpdateNotification = (attendee: string, eventCreator: string, eventId: string) => {
        const notification = new Notification();
        notification.id = uuid();
        notification.notificationType = NotificationType.EVENT_EDITTED;
        notification.senderId = eventCreator;
        notification.receiverId = attendee;
        notification.subjectId = eventId;
        return notification;
    }


}