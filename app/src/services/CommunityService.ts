import typeorm, { getRepository } from "typeorm";
import { ConflictStatus, ForbiddenStatus } from "../utils/HTTPStatuses";
import { HTTPError } from "../utils/HTTPError";
import { MembershipType } from "../enums/MembershipType";
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
            throw new HTTPError(ForbiddenStatus);
        }
        return community;
    }

    getCommunitiesForUser = async (userdId: string): Promise<Community[]> => {
        return await this.communityRepository.find({ where: { user: userdId } });
    }

    saveMemberships = async (memberships: Membership[]): Promise<void> => {
        const validationPromises = memberships.map(async membership => {
            const existingAttendance = await this.membershipRepository.findOne({ where: { user: membership.user, community: membership.community } });
            if (!!existingAttendance) {
                throw new HTTPError(ConflictStatus);
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
        const existingCommunity = await this.communityRepository.findOne({ where: { name: community.name } });
        if (!!existingCommunity) {
            throw new HTTPError(ConflictStatus);
        }
        await this.communityRepository.save(community);
    };

    getMembership = async (userId: string, communityId: string): Promise<Membership> => {
        const membership = await this.membershipRepository.findOne({ where: { user: userId, community: communityId } });
        if (membership === undefined) {
            throw new HTTPError(ForbiddenStatus);
        }
        return membership;
    }

    getCommunityMemberships = async (communityId: string): Promise<Membership[]> => {
        return await this.membershipRepository.find({ where: { community: communityId } });
    }

    getCommunityMemberIds = async (communityId: string): Promise<string[]> => {
        const memberships = await this.membershipRepository.find({ where: { community: communityId } });
        memberships.filter(membership => membership.membershipType === MembershipType.ADMIN || membership.membershipType === MembershipType.MEMBER);
        return memberships.map(membership => membership.user);
    }

    getCommunityAdminIds = async (communityId: string): Promise<string[]> => {
        const memberships = await this.membershipRepository.find({ where: { community: communityId } });
        memberships.filter(membership => membership.membershipType === MembershipType.ADMIN);
        return memberships.map(membership => membership.user);
    }

    getUsersCommunityIds = async (userId: string): Promise<string[]> => {
        const memberships = await this.membershipRepository.find({ where: { community: userId } });
        memberships.filter(membership => membership.membershipType === MembershipType.ADMIN || membership.membershipType === MembershipType.MEMBER);
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
                throw new HTTPError(ConflictStatus);
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
            if (existingMembership.membershipType !== MembershipType.INVITED) {
                throw new HTTPError(ConflictStatus);
            }
            existingMembership.membershipType = MembershipType.MEMBER;
            await this.membershipRepository.update(existingMembership.id, existingMembership);
            return;
        }
        throw new HTTPError(ForbiddenStatus);
    }

}

export default CommuntiyService;