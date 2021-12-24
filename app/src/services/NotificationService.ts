import typeorm, { getRepository } from "typeorm";
import Event from "../entities/Event";
import Notification from '../entities/Notification';
import NotificationFactory from "../factories/NotificationFactory";
import Logger from "../utils/Logger";
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

    getNotifcationsForUser = async (userId: string, logger: Logger): Promise<Notification[]> => {
        logger.info(`Getting notifications for user ${userId}`);
        return this.notificationRepository.find({ where: { receiverId: userId } });
    };

    insertNotification = async (notification: Notification, logger: Logger): Promise<void> => {
        try {
            logger.info('Inserting validating & inseting notification', { notification });
            await ValidationHelper.validateEntity(notification);
            await this.notificationRepository.insert(notification);
        } catch (err) {
            const insertNotificationError = err as Error;
            logger.warn('Unable to insert notification with error: ' + insertNotificationError.message, { notification });
        }
    }

    sendAddFriendNotification = async (inviteeId: string, senderUserId: string, logger: Logger): Promise<void> => {
        const notification = NotificationFactory.makeAddFriendNotification(inviteeId, senderUserId);
        await this.insertNotification(notification, logger);
    }

    sendAcceptFriendNotification = async (inviteeId: string, acceptedUserId: string, logger: Logger): Promise<void> => {
        const notification = NotificationFactory.makeAcceptFriendNotification(inviteeId, acceptedUserId);
        await this.insertNotification(notification, logger);
    }

    sendCommunityEventNotficiations = async (communityId: string, eventId: string, logger: Logger): Promise<void> => {
        const users = await this.communitityService.getCommunityMemberIds(communityId);
        const savePromises = users.map(async userId => {
            const notification = NotificationFactory.makeCommunityEventCreatedNotification(userId, communityId, eventId);
            return this.insertNotification(notification, logger);
        });
        await Promise.all(savePromises).catch( err => { throw err });
    }

    sendEventInviteNotifications = async (eventId: string, invitees: string[], senderId: string, logger: Logger): Promise<void> => {
        const savePromises = invitees.map(async invitee => {
            const notification = NotificationFactory.makeEventInviteNotification(invitee, senderId, eventId);
            return this.insertNotification(notification, logger);
        });
        await Promise.all(savePromises).catch( err => { throw err });
    }

    sendEventAttendanceNotification = async (attendee: string , eventCreator: string, eventId: string, logger: Logger): Promise<void> => {
        const notification = NotificationFactory.makeEventAttendanceNotification(attendee, eventCreator, eventId);
        await this.insertNotification(notification, logger);
    }

    sendEventUpdateNotifications = async (event: Event, logger: Logger): Promise<void> => {
        let userIds: string[];
        if (!!event.community) {
            userIds = await this.communitityService.getCommunityMemberIds(event.community);
        } else {
            userIds = await this.eventService.getEventExpectedAttendanceUserIds(event.id);
        }
        const savePromises = userIds.map(async userId => {
            const notification = NotificationFactory.makeEventUpdateNotification(userId, event.creator, event.id);
            return this.insertNotification(notification, logger);
        });
        await Promise.all(savePromises).catch( err => { throw err });
    }

    sendCommunityInviteNotifications = async (communityId: string, invitees: string[], senderId: string, logger: Logger): Promise<void> => {
        const savePromises = invitees.map(async invitee => {
            const notification = NotificationFactory.makeCommunityInviteNotification(invitee, senderId, communityId);
            return this.insertNotification(notification, logger);
        });
        await Promise.all(savePromises).catch( err => { throw err });
    }

    sendAcceptCommunityNotification = async (userId: string, communityId: string, logger: Logger): Promise<void> => {
        const communityAdminIds = await this.communitityService.getCommunityAdminIds(communityId, logger);
        const savePromises = communityAdminIds.map(async adminId => {
            const notification = NotificationFactory.makeAcceptCommunityInviteNotification(userId, adminId, communityId);
            return this.insertNotification(notification, logger);
        });
        await Promise.all(savePromises).catch( err => { throw err });
    }

    sendCommunityUpdateNotifications = async (userId: string, communityId: string, logger: Logger): Promise<void> => {
        const communityMemberIds = await this.communitityService.getCommunityMemberIds(communityId);
        const savePromises = communityMemberIds.map(async memberId => {
            const notification = NotificationFactory.makeCommunityUpdateNotifications(userId, memberId, communityId);
            return this.insertNotification(notification, logger);
        });
        await Promise.all(savePromises).catch( err => { throw err });
    }

}

export default NotificationService;