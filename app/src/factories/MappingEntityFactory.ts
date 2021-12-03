import { uuid } from "uuidv4";
import Attendance from "../entities/Attendance";
import Membership from "../entities/Membership";
import Friendship from "../entities/Friendship";
import { AttendanceStatus } from "../enums/AttendanceStatus";
import { MembershipStatus } from "../enums/MembershipStatus";
import { FriendshipStatus } from "../enums/FriendshipStatus";

export default class MappingEntityFactory {

    static makeAdminMembership(communityId: string, userId: string): Membership {
        const membership = new Membership();
        membership.id = uuid();
        membership.MembershipStatus = MembershipStatus.ADMIN;
        membership.user = userId;
        membership.community = communityId;
        return membership;
    }

    static makeInvitedMembership(communityId: string, userId: string): Membership {
        const membership = new Membership();
        membership.id = uuid();
        membership.MembershipStatus = MembershipStatus.INVITED;
        membership.user = userId;
        membership.community = communityId;
        return membership;
    }

    static makeInvitedAttendance(eventId: string, invitee: string) {
        const attendance = new Attendance();
        attendance.id = uuid();
        attendance.lastUpdated = new Date().toISOString();
        attendance.AttendanceStatus = AttendanceStatus.INVITED;
        attendance.event = eventId;
        attendance.user = invitee;
        return attendance;
    }

    static makeRequestedFriendship(userOne: string, userTwo: string) {
        const friendship = new Friendship();
        friendship.id = uuid();
        friendship.userOne = userOne; // invitee
        friendship.userTwo = userTwo; // requester
        friendship.FriendshipStatus = FriendshipStatus.REQUESTED;
        return friendship;
    }

}