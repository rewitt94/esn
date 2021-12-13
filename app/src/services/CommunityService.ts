import typeorm, { getRepository } from "typeorm";
import { ConflictStatus, ForbiddenStatus } from "../utils/HTTPStatuses";
import { HTTPError } from "../utils/HTTPError";
import { MembershipStatus } from "../enums/MembershipStatus";
import MappingEntityFactory from "../factories/MappingEntityFactory";
import ValidationHelper from "../utils/ValidationHelper";
import Community from '../entities/Community';
import Membership from '../entities/Membership';

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

    getCommunitiesForUser = async (userdId: string): Promise<Community[]> => {
        return await this.communityRepository.find({ where: { user: userdId } });
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

    saveCommunity = async (community: Community): Promise<void> => {
        const existingCommunity = await this.communityRepository.findOne({ where: { id: community.id } });
        if (!!existingCommunity) {
            throw new HTTPError(ConflictStatus, 'saveCommunity - failed to save community being community already exists', { community });
        }
        await this.communityRepository.save(community);
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
        memberships.filter(membership => membership.MembershipStatus === MembershipStatus.ADMIN || membership.MembershipStatus === MembershipStatus.MEMBER);
        return memberships.map(membership => membership.user);
    }

    getCommunityAdminIds = async (communityId: string): Promise<string[]> => {
        const memberships = await this.membershipRepository.find({ where: { community: communityId } });
        memberships.filter(membership => membership.MembershipStatus === MembershipStatus.ADMIN);
        return memberships.map(membership => membership.user);
    }

    getUsersCommunityIds = async (userId: string): Promise<string[]> => {
        const memberships = await this.membershipRepository.find({ where: { community: userId } });
        memberships.filter(membership => membership.MembershipStatus === MembershipStatus.ADMIN || membership.MembershipStatus === MembershipStatus.MEMBER);
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
            if (existingMembership.MembershipStatus !== MembershipStatus.INVITED) {
                throw new HTTPError(ConflictStatus, 'acceptMembership - cannot accept community invite membership is not in INVITED status', { existingMembership });
            }
            existingMembership.MembershipStatus = MembershipStatus.MEMBER;
            await this.membershipRepository.update(existingMembership.id, existingMembership);
            return;
        }
        throw new HTTPError(ForbiddenStatus, 'acceptMembership - membership not found by communityId and userId', { userId, communityId });
    }

}

export default CommuntiyService;