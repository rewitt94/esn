import * as express from 'express';
import jwt from "jsonwebtoken";
import EnvVars from "../utils/EnvVars";
import { MembershipStatus } from '../enums/MembershipStatus';
import { HTTPError } from "../utils/HTTPError";
import { ForbiddenStatus, UnauthorizedStatus } from "../utils/HTTPStatuses";
import UserService from './UserService';
import CommuntiyService from './CommunityService';
import EventService from './EventService';
import User from "../entities/User";
import { AccessTokenStatus } from '../enums/AccessTokenStatus';
import { AccessTokenClaims } from '../interfaces.ts/AccessTokenClaims';

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

    createInitialAccessToken = (user: User): string => {
        return jwt.sign({
            exp: Math.ceil((new Date().getTime() / 1000) + EXPIRY_HOURS * 60 * 60),
            user: user.id,
            username: user.username,
            status: AccessTokenStatus.INTIAL
        }, EnvVars.get().valueOf("JWT_SECRET"));
    };

    createFullAccessToken = (user: User): string => {
        return jwt.sign({
            exp: Math.ceil((new Date().getTime() / 1000) + EXPIRY_HOURS * 60 * 60),
            user: user.id,
            username: user.username,
            status: AccessTokenStatus.FULL
        }, EnvVars.get().valueOf("JWT_SECRET"));
    }

    validateFullAccessToken = (request: express.Request): void => {
        const authHeader = request.header('Authorization');
        if (authHeader === undefined) {
            throw new HTTPError(UnauthorizedStatus, 'validateFullAccessToken - Authorization header was not provided');
        }
        const accessToken = authHeader.split("Bearer ")[1];
        if (accessToken === undefined) {
            throw new HTTPError(UnauthorizedStatus, 'validateFullAccessToken - Authorization header unexpected format');
        }
        try {
            jwt.verify(accessToken, EnvVars.get().valueOf("JWT_SECRET"));
        } catch (err) {
            throw new HTTPError(UnauthorizedStatus, 'validateFullAccessToken - access token could not be verified');
        }
        const decoded = jwt.decode(accessToken) as AccessTokenClaims;
        if (!decoded || !decoded.status || decoded.status !== AccessTokenStatus.FULL) {
            throw new HTTPError(ForbiddenStatus, 'validateFullAccessToken - user does not have full access');
        }
    }

    validateInitialAccessToken = (request: express.Request): void => {
        const authHeader = request.header('Authorization');
        if (authHeader === undefined) {
            throw new HTTPError(UnauthorizedStatus, 'validateInitialAccessToken - Authorization header was not provided');
        }
        const accessToken = authHeader.split("Bearer ")[1];
        if (accessToken === undefined) {
            throw new HTTPError(UnauthorizedStatus, 'validateInitialAccessToken - Authorization header unexpected format');
        }
        try {
            jwt.verify(accessToken, EnvVars.get().valueOf("JWT_SECRET"));
        } catch (err) {
            const decoded = jwt.decode(accessToken) as AccessTokenClaims;
            if (!decoded || !decoded.status) {
                throw new HTTPError(UnauthorizedStatus, 'validateInitialAccessToken - user does not have full access');
            }
        }
    }

    getUserId = (request: express.Request): string => {
        const authHeader = request.header('Authorization');
        if (authHeader === undefined) {
            throw new HTTPError(UnauthorizedStatus, 'getUserId - Authorization header was not provided');
        }
        const accessToken = authHeader.split("Bearer ")[1];
        if (accessToken === undefined) {
            throw new HTTPError(UnauthorizedStatus, 'getUserId - Authorization header unexpected format');
        }
        try {
            const decoded = jwt.decode(accessToken) as AccessTokenClaims;
            if (!!decoded && !!decoded.user) {
                return decoded.user;
            }
        } catch (err) {
            throw new HTTPError(UnauthorizedStatus, 'getUserId - token could not be decoded');
        }
        throw new HTTPError(UnauthorizedStatus, 'getUserId - usedId not found in token claims');
    };

    validateUserHasFullAccess = (user: User): void => {
        if (this.checkUserHasFullAccess(user)) {
            return;
        }
        throw new HTTPError(ForbiddenStatus, 'validateUserHasFullAccess - assertion failed');
    }

    checkUserHasFullAccess = (user: User): boolean => {
        return !!user.firstName && !!user.lastName && !!user.dateOfBirth;
    }

    validateUserIsEventCreator = async (eventId: string, userId: string): Promise<void> => {
        const event = await this.eventService.getEvent(eventId);
        if (event.creator === userId) {
            return;
        }
        throw new HTTPError(ForbiddenStatus, 'validateUserIsEventCreator - assertion failed');
    }

    validateUserCanInviteToEvent = async (eventId: string, userId: string): Promise<void> => {
        const event = await this.eventService.getEvent(eventId);
        if (event.creator !== userId) {
            throw new HTTPError(ForbiddenStatus, 'validateUserCanInviteToEvent - assertion failed');
        }
        if (!!event.community) {
            throw new HTTPError(ForbiddenStatus, 'validateUserCanInviteToEvent - event does not have community');
        }
    }

    validateUserIsVisible = async (requestingUser: string, targetUser: string): Promise<void> => {
        if (requestingUser === targetUser) {
            return;
        }
        if (await this.userService.areFriends(requestingUser, targetUser)) {
            return;
        }
        if (await this.userService.friendInviteExists(requestingUser, targetUser)) {
            return;
        }
        throw new HTTPError(ForbiddenStatus, 'validateUserIsVisible - all assertions failed');
    }

    validateInviteesAreFriends = async (senderId: string, invitees: string[]): Promise<void> => {
        for (const invitee of invitees) {
            if (await this.userService.areFriends(senderId, invitee) === false) {
                throw new HTTPError(ForbiddenStatus, 'validateInviteesAreFriends - users are not friends');
            }
        };
    };

    validateUserIsCommunityAdmin = async (userId: string, communityId: string): Promise<void> => {
        const membership = await this.communitityService.getMembership(userId, communityId);
        if (membership.membershipStatus === MembershipStatus.ADMIN) {
            return;
        }
        throw new HTTPError(ForbiddenStatus, 'validateUserIsCommunityAdmin - user is not community admin');
    }

    validateCommunityIsVisible = async (userdId: string, communityId: string): Promise<void> => {
        await this.communitityService.getMembership(userdId, communityId);
    }

    validateEventIsVisible = async (userdId: string, eventId: string): Promise<void> => {
        await this.eventService.getAttendance(userdId, eventId);
    }

    validateMembership = async (userdId: string, communityId: string): Promise<void> => {
        const membership = await this.communitityService.getMembership(userdId, communityId);
        if (membership.membershipStatus === MembershipStatus.MEMBER || membership.membershipStatus === MembershipStatus.ADMIN) {
            return;
        }
        throw new HTTPError(ForbiddenStatus, 'validateMembership - user is not member of community');
    }

}

export default AuthService;