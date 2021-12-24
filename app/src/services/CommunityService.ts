import typeorm, { getRepository } from "typeorm";
import { ConflictStatus, ForbiddenStatus } from "../utils/HTTPStatuses";
import { HTTPError } from "../utils/HTTPError";
import { MembershipStatus } from "../enums/MembershipStatus";
import MappingEntityFactory from "../factories/MappingEntityFactory";
import ValidationHelper from "../utils/ValidationHelper";
import Community from '../entities/Community';
import Membership from '../entities/Membership';
import Logger from "../utils/Logger";

class CommuntiyService {

    private communityRepository: typeorm.Repository<Community>;
    private membershipRepository: typeorm.Repository<Membership>;
    private static instance: CommuntiyService;

    private constructor() {
        this.communityRepository = getRepository(Community);
        this.membershipRepository = getRepository(Membership);
    }

    static getInstance = (): CommuntiyService => {
        if (!CommuntiyService.instance) {
            CommuntiyService.instance = new CommuntiyService();
        }
        return CommuntiyService.instance;
    }

    getCommunity = async (communityId: string): Promise<Community> => {
        const community = await this.communityRepository.findOne({ where: { id: communityId } });
        if (community === undefined) {
            throw new HTTPError(ForbiddenStatus, 'getCommunity - community not found by communityId', { communityId });
        }
        return community;
    }

    getCommunitiesForUser = async (userId: string, logger: Logger): Promise<Community[]> => {
        const communityIds = await this.getUsersCommunityIds(userId, logger);
        logger.info(`Returning communties that user is accepted into`, { userId, communityIds });
        const promisedCommunities = communityIds.map(async communityId => {
            return await this.communityRepository.findOne({ where: { id: communityId } });
        });
        const communties = await Promise.all(promisedCommunities).catch( err => { throw err });
        return communties.filter(this.notEmpty);
    }

    saveMemberships = async (memberships: Membership[]): Promise<void> => {
        const validationPromises = memberships.map(async membership => {
            const existingMembership = await this.membershipRepository.findOne({ where: { user: membership.user, community: membership.community } });
            if (!!existingMembership) {
                throw new HTTPError(ConflictStatus, 'saveMemberships - membership cannot be saved as already exists', existingMembership);
            }
        })
        await Promise.all(validationPromises).catch( err => { throw err });
        const savePromises = memberships.map(async membership => {
            await this.membershipRepository.save(membership);
        })
        await Promise.all(savePromises).catch( err => { throw err });
    }

    updateCommunity = async (community: Community): Promise<void> => {
        await this.communityRepository.update(community.id, community);
    }

    insertCommunity = async (community: Community): Promise<void> => {
        await this.communityRepository.insert(community);
    };

    getMembership = async (userId: string, communityId: string): Promise<Membership> => {
        const membership = await this.membershipRepository.findOne({ where: { user: userId, community: communityId } });
        if (membership === undefined) {
            throw new HTTPError(ForbiddenStatus, 'getMembership - membership not found by communityId and userId', { userId, communityId });
        }
        return membership;
    }

    getCommunityMemberships = async (communityId: string): Promise<Membership[]> => {
        return await this.membershipRepository.find({ where: { community: communityId } });
    }

    getCommunityMemberIds = async (communityId: string): Promise<string[]> => {
        const memberships = await this.membershipRepository.find({ where: { community: communityId } });
        memberships.filter(membership => membership.membershipStatus === MembershipStatus.ADMIN || membership.membershipStatus === MembershipStatus.MEMBER);
        return memberships.map(membership => membership.user);
    }

    getCommunityAdminIds = async (communityId: string, logger: Logger): Promise<string[]> => {
        logger.info(`Getting admins for community ${communityId}`);
        let memberships = await this.membershipRepository.find({ where: { community: communityId } });
        memberships = memberships.filter(membership => membership.membershipStatus === MembershipStatus.ADMIN);
        return memberships.map(membership => membership.user);
    }

    getUsersCommunityIds = async (userId: string, logger: Logger): Promise<string[]> => {
        logger.info(`Getting communities for user ${userId}`);
        const memberships = await this.membershipRepository.find({ where: { user: userId } });
        memberships.filter(membership => membership.membershipStatus === MembershipStatus.ADMIN || membership.membershipStatus === MembershipStatus.MEMBER);
        return memberships.map(membership => membership.community);
    }

    inviteUsersToCommunity = async (communityId: string, invitees: string[]): Promise<void> => {
        const membershipPromises = invitees.map(async invitee => {
            const membership = MappingEntityFactory.makeInvitedMembership(communityId, invitee);
            await ValidationHelper.validateEntity(membership);
            return membership;
        })
        const memberships = await Promise.all(membershipPromises).catch( err => { throw err });
        const validationPromises = memberships.map(async membership => {
            const existingMembership = await this.membershipRepository.findOne({ where: { user: membership.user, community: membership.community } });
            if (!!existingMembership) {
                throw new HTTPError(ConflictStatus, 'inviteUsersToCommunity - failed to invite user to community because invite already exists', { existingMembership });
            }
        })
        await Promise.all(validationPromises).catch( err => { throw err });
        const savePromises = memberships.map(async membership => {
            await this.membershipRepository.save(membership);
        })
        await Promise.all(savePromises).catch( err => { throw err });
    };

    acceptMembership = async (userId: string, communityId: string): Promise<void> => {
        const existingMembership = await this.membershipRepository.findOne({ where: { user: userId, community: communityId } });
        if (!!existingMembership) {
            if (existingMembership.membershipStatus !== MembershipStatus.INVITED) {
                throw new HTTPError(ConflictStatus, 'acceptMembership - cannot accept community invite membership is not in INVITED status', { existingMembership });
            }
            existingMembership.membershipStatus = MembershipStatus.MEMBER;
            await this.membershipRepository.update(existingMembership.id, existingMembership);
            return;
        }
        throw new HTTPError(ForbiddenStatus, 'acceptMembership - membership not found by communityId and userId', { userId, communityId });
    }

    notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
        return value !== null && value !== undefined;
    };

}

export default CommuntiyService;