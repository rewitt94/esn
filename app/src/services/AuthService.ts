import * as express from 'express';
import jwt from "jsonwebtoken";
import EnvVars from "../utils/EnvVars";
import { MembershipType } from '../enums/MembershipType';
import { HTTPError } from "../utils/HTTPError";
import { BadRequestStatus, ForbiddenStatus, UnauthorizedStatus } from "../utils/HTTPStatuses";
import UserService from './UserService';
import CommuntiyService from './CommunityService';
import EventService from './EventService';
import User from "../entities/User";

const EXPIRY_HOURS = 24;

class AuthService {

    private static instance: AuthService;
    private userService = UserService.getInstance();
    private communitityService = CommuntiyService.getInstance();
    private eventService = EventService.getInstance();

    private constructor() {};

    static getInstance = (): AuthService => {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    };

    createAccessToken = (user: User): string => {
        return jwt.sign({
            exp: Math.ceil((new Date().getTime() / 1000) + EXPIRY_HOURS * 60 * 60),
            user: user.id
        }, EnvVars.get().valueOf("JWT_SECRET"));
    };

    validateAccessToken = (request: express.Request): void => {
        const authHeader = request.header('Authorization');
        if (authHeader === undefined) {
            throw new HTTPError(UnauthorizedStatus);
        }
        const accessToken = authHeader.split("Bearer ")[1];
        if (accessToken === undefined) {
            throw new HTTPError(UnauthorizedStatus);
        }
        try {
            jwt.verify(accessToken, EnvVars.get().valueOf("JWT_SECRET"));
        } catch (err) {
            throw new HTTPError(UnauthorizedStatus);
        }
    }

    getUserId = (request: express.Request): string => {
        const authHeader = request.header('Authorization');
        if (authHeader === undefined) {
            throw new HTTPError(UnauthorizedStatus);
        }
        const accessToken = authHeader.split("Bearer ")[1];
        if (accessToken === undefined) {
            throw new HTTPError(UnauthorizedStatus);
        }
        const decoded = jwt.decode(accessToken);
        // @ts-ignore
        if (!!decoded && !!decoded.user) {
            // @ts-ignore
            return decoded.user;
        }
        throw new HTTPError(UnauthorizedStatus);
    };


    validateUserIsEventCreator = async (eventId: string, userId: string): Promise<void> => {
        const event = await this.eventService.getEvent(eventId);
        if (event.creator === userId) {
            return;
        }
        throw new HTTPError(ForbiddenStatus);
    }

    validateUserCanInviteToEvent = async (eventId: string, userId: string): Promise<void> => {
        const event = await this.eventService.getEvent(eventId);
        if (event.creator !== userId) {
            throw new HTTPError(ForbiddenStatus);
        }
        if (!!event.community) {
            throw new HTTPError(BadRequestStatus);
        }
    }

    validateUserIsVisible = async (requestingUser: string, targetUser: string): Promise<void> => {
        console.log(requestingUser)
        console.log(targetUser)
        if (requestingUser === targetUser) {
            return;
        }
        if (await this.userService.areFriends(requestingUser, targetUser)) {
            return;
        }
        if (await this.userService.friendInviteExists(requestingUser, targetUser)) {
            return;
        }
        console.log("here")
        throw new HTTPError(ForbiddenStatus);
    }

    validateInviteesAreFriends = async (senderId: string, invitees: string[]): Promise<void> => {
        for (const invitee in invitees) {
            if (await this.userService.areFriends(senderId, invitee) === false) {
                throw new HTTPError(ForbiddenStatus);
            }
        };
    };

    validateUserIsCommunityAdmin = async (userId: string, communityId: string): Promise<void> => {
        const membership = await this.communitityService.getMembership(userId, communityId);
        if (membership.membershipType === MembershipType.ADMIN) {
            return;
        }
        throw new HTTPError(ForbiddenStatus);
    }

    validateCommunityIsVisible = async (userdId: string, communityId: string): Promise<void> => {
        await this.communitityService.getMembership(userdId, communityId);
    }

    validateEventIsVisible = async (userdId: string, eventId: string): Promise<void> => {
        await this.eventService.getAttendance(userdId, eventId);
    }

    validateMembership = async (userdId: string, communityId: string): Promise<void> => {
        const membership = await this.communitityService.getMembership(userdId, communityId);
        if (membership.membershipType === MembershipType.MEMBER || membership.membershipType === MembershipType.ADMIN) {
            return;
        }
        throw new HTTPError(ForbiddenStatus);
    }

}

export default AuthService;