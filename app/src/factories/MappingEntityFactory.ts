import { uuid } from "uuidv4";
import Attendance from "../entities/Attendance";
import Membership from "../entities/Membership";
import Friendship from "../entities/Friendship";
import { AttendanceType } from "../enums/AttendanceType";
import { MembershipType } from "../enums/MembershipType";
import { FriendshipType } from "../enums/FriendshipType";

export default class MappingEntityFactory {

    static makeAdminMembership(communityId: string, userId: string): Membership {
        const membership = new Membership();
        membership.id = uuid();
        membership.membershipType = MembershipType.ADMIN;
        membership.user = userId;
        membership.community = communityId;
        return membership;
    }

    static makeInvitedMembership(communityId: string, userId: string): Membership {
        const membership = new Membership();
        membership.id = uuid();
        membership.membershipType = MembershipType.INVITED;
        membership.user = userId;
        membership.community = communityId;
        return membership;
    }

    static makeInvitedAttendance(eventId: string, invitee: string) {
        const attendance = new Attendance();
        attendance.id = uuid();
        attendance.lastUpdated = new Date().toISOString();
        attendance.attendanceType = AttendanceType.INVITED;
        attendance.event = eventId;
        attendance.user = invitee;
        return attendance;
    }

    static makeRequestedFriendship(userOne: string, userTwo: string) {
        const friendship = new Friendship();
        friendship.id = uuid();
        friendship.userOne = userOne;
        friendship.userTwo = userTwo;
        friendship.friendshipType = FriendshipType.REQUESTED;
        return friendship;
    }

}