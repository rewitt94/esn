import typeorm, { getRepository } from "typeorm";
import Event from "../entities/Event";
import Notification from '../entities/Notification';
import NotificationFactory from "../factories/NotificationFactory";
import ValidationHelper from "../utils/ValidationHelper";
import CommuntiyService from "./CommunityService";
import EventService from "./EventService";

class NotificationService {

    private static instance: NotificationService;
    private notificationRepository: typeorm.Repository<Notification>;
    private communitityService = CommuntiyService.getInstance();
    private eventService = EventService.getInstance();

    private constructor() {
        this.notificationRepository = getRepository(Notification);
    };

    static getInstance = (): NotificationService => {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    };

    getNotifcationsForUser = async (userId: string): Promise<Notification[]> => {
        return await this.notificationRepository.find({ where: { receiverId: userId } });
    }

    saveNotification = async (notification: Notification): Promise<void> => {
        try {
            await ValidationHelper.validateEntity(notification);
            await this.notificationRepository.save(notification);
        } catch (err) {
            console.error("Notification is invalid")
        }
    }

    sendAddFriendNotification = async (inviteeId: string, senderUserId: string): Promise<void> => {
        const notification = NotificationFactory.makeAddFriendNotification(inviteeId, senderUserId);
        await this.saveNotification(notification);
    }

    sendAcceptFriendNotification = async (inviteeId: string, acceptedUserId: string): Promise<void> => {
        const notification = NotificationFactory.makeAcceptFriendNotification(inviteeId, acceptedUserId);
        await this.saveNotification(notification);
    }

    sendCommunityEventNotficiations = async (communityId: string, eventId: string): Promise<void> => {
        const users = await this.communitityService.getCommunityMemberIds(communityId);
        const savePromises = users.map(async userId => {
            const notification = NotificationFactory.makeCommunityEventCreatedNotification(userId, communityId, eventId);
            return this.saveNotification(notification);
        });
        await Promise.all(savePromises).catch( err => { throw err });
    }

    sendEventInviteNotifications = async (eventId: string, invitees: string[], senderId: string): Promise<void> => {
        const savePromises = invitees.map(async invitee => {
            const notification = NotificationFactory.makeEventInviteNotification(invitee, senderId, eventId);
            return this.saveNotification(notification);
        });
        await Promise.all(savePromises).catch( err => { throw err });
    }

    sendEventAttendanceNotification = async (attendee: string , eventCreator: string, eventId: string): Promise<void> => {
        const notification = NotificationFactory.makeEventAttendanceNotification(attendee, eventCreator, eventId);
        await this.saveNotification(notification);
    }

    sendEventUpdateNotifications = async (event: Event): Promise<void> => {
        let userIds: string[];
        if (!!event.community) {
            userIds = await this.communitityService.getCommunityMemberIds(event.community);
        } else {
            userIds = await this.eventService.getEventExpectedAttendanceUserIds(event.id);
        }
        const savePromises = userIds.map(async userId => {
            const notification = NotificationFactory.makeEventUpdateNotification(userId, event.creator, event.id);
            return this.saveNotification(notification);
        });
        await Promise.all(savePromises).catch( err => { throw err });
    }

    sendCommunityInviteNotifications = async (communityId: string, invitees: string[], senderId: string): Promise<void> => {
        const savePromises = invitees.map(async invitee => {
            const notification = NotificationFactory.makeCommunityInviteNotification(invitee, senderId, communityId);
            return this.saveNotification(notification);
        });
        await Promise.all(savePromises).catch( err => { throw err });
    }

    sendAcceptCommunityNotification = async (userId: string, communityId: string): Promise<void> => {
        const communityAdminIds = await this.communitityService.getCommunityAdminIds(communityId);
        const savePromises = communityAdminIds.map(async adminId => {
            const notification = NotificationFactory.makeAcceptCommunityInviteNotification(userId, adminId, communityId);
            return this.saveNotification(notification);
        });
        await Promise.all(savePromises).catch( err => { throw err });
    }

    sendCommunityUpdateNotifications = async (userId: string, communityId: string): Promise<void> => {
        const communityMemberIds = await this.communitityService.getCommunityMemberIds(communityId);
        const savePromises = communityMemberIds.map(async memberId => {
            const notification = NotificationFactory.makeCommunityUpdateNotifications(userId, memberId, communityId);
            return this.saveNotification(notification);
        });
        await Promise.all(savePromises).catch( err => { throw err });
    }

}

export default NotificationService;