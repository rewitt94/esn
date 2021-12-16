import typeorm, { getRepository } from "typeorm";
import bcrypt from "bcrypt";
import User from '../entities/User';
import Friendship from '../entities/Friendship';
import LoginRequest from "../requestbody/LoginRequest";
import { BadRequestStatus, ConflictStatus, ForbiddenStatus, UnauthorizedStatus } from "../utils/HTTPStatuses";
import { HTTPError } from "../utils/HTTPError";
import MappingEntityFactory from "../factories/MappingEntityFactory";
import { FriendshipStatus } from "../enums/FriendshipStatus";
import Logger from "../utils/Logger";

class UserService {

    private userRepository: typeorm.Repository<User>;
    private friendRepository: typeorm.Repository<Friendship>;

    private static instance: UserService;

    private constructor() {
        this.userRepository = getRepository(User);
        this.friendRepository = getRepository(Friendship);
    };

    static getInstance = (): UserService => {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    };

    insertUser = async (user: User): Promise<void> => {
        const existingUser = await this.userRepository.findOne({ where: { username: user.username } });
        if (!!existingUser) {
            throw new HTTPError(ConflictStatus, 'insertUser - cannot save user because username already exists', { existingUser });
        }
        await this.userRepository.insert(user);
    };

    login = async (login: LoginRequest): Promise<User> => {
        const user = await this.userRepository.findOne({ where: { username: login.username } });
        if (!user) {
            throw new HTTPError(UnauthorizedStatus, 'login - cannot login because username not recognised', { username: login.username });
        }
        const success = bcrypt.compareSync(login.password, user.hashedPassword!);
        if (!success) {
            throw new HTTPError(UnauthorizedStatus, 'login - cannot login because password does not match');
        }
        return user;
    };

    getUser = async (userId: string): Promise<User> => {
       const user = await this.userRepository.findOne({ where: { id: userId } });
       if (user === undefined) {
           throw new HTTPError(ForbiddenStatus, 'getUser - user not found by userId', { userId });
       }
       return user;
    }

    updateUser = async (user: User): Promise<void> => {
        await this.userRepository.update(user.id!, user);
    }

    userExists = async (userId: string): Promise<boolean> => {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return false;
        }
        return true;
    };

    usernameToId = async (username: string): Promise<string> => {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new HTTPError(ForbiddenStatus, 'usernameToId - user not found by username', { username });
        }
        return user.id!;
    }

    addFriend = async (inviteeId: string, requesterId: string, logger: Logger): Promise<void> => {
        if (inviteeId === requesterId) {
            throw new HTTPError(BadRequestStatus, 'addFriend - user invitee cannot match requester', { inviteeId, requesterId });
        }
        const existingFriendship = await this.friendRepository.findOne({ where: { userOne: inviteeId, userTwo: requesterId } });
        if (!!existingFriendship) {
            throw new HTTPError(ConflictStatus, 'addFriend - cannot create friendship as already exists', { existingFriendship });
        }
        const existingFriendshipInverse = await this.friendRepository.findOne({ where: { userOne: requesterId, userTwo: inviteeId } });
        if (!!existingFriendshipInverse) {
            throw new HTTPError(ConflictStatus, 'addFriend - cannot create friendship as already exists', { existingFriendshipInverse });
        }
        const friendship = MappingEntityFactory.makeRequestedFriendship(inviteeId, requesterId);
        logger.info('addFriend - saving friendship', { friendship })
        await this.friendRepository.save(friendship);
    };

    friendInviteExists = async (inviteeId: string, requesterId: string) : Promise<boolean> => {
        const friendship = await this.friendRepository.findOne({ where: { userOne: inviteeId, userTwo: requesterId } });
        return !!friendship && friendship.FriendshipStatus === FriendshipStatus.REQUESTED;
    }

    acceptFriend = async (inviteeId: string, requesterId: string): Promise<void> => {
        const existingFriendship = await this.friendRepository.findOne({ where: { userOne: inviteeId, userTwo: requesterId } });
        if (!!existingFriendship) {
            if (existingFriendship.FriendshipStatus === FriendshipStatus.ACCEPTED) {
                throw new HTTPError(ForbiddenStatus, 'acceptFriend - cannot accept friendship that is already accepted', { existingFriendship });
            }
            existingFriendship.FriendshipStatus = FriendshipStatus.ACCEPTED;
            await this.friendRepository.update(existingFriendship.id, existingFriendship);
            return;
        }
        throw new HTTPError(ForbiddenStatus, 'acceptFriend - cannot accept friendship that does not exist', { inviteeId, requesterId });
    };

    getFriends =  async (userId: string): Promise<User[]> => {
        let friendships: Friendship[] = [];
        friendships = friendships.concat(await this.friendRepository.find({ where: { userOne: userId } }));
        friendships = friendships.concat(await this.friendRepository.find({ where: { userTwo: userId } }));
        friendships = friendships.filter(friendship => friendship.FriendshipStatus === FriendshipStatus.ACCEPTED);
        const promises = friendships.map(async friendship => {
            if (friendship.userOne === userId) {
                return await this.userRepository.findOne(friendship.userTwo);
            }
            return await this.userRepository.findOne(friendship.userOne);
        });
        const friends = await Promise.all(promises).catch(err => { throw err })
        return friends.filter(this.notEmpty).map(user => user.removePrivateData());
    };

    getFriendRequests =  async (userId: string): Promise<User[]> => {
        let friendRequests = await this.friendRepository.find({ where: { userOne: userId } });
        friendRequests = friendRequests.filter(friendship => friendship.FriendshipStatus === FriendshipStatus.REQUESTED);
        const promises = friendRequests.map(async friendRequest => {
            return await this.userRepository.findOne(friendRequest.userTwo);
        });
        const friends = await Promise.all(promises).catch(err => { throw err })
        return friends.filter(this.notEmpty).map(user => user.removePrivateData());
    };

    areFriends = async (userOne: string, userTwo: string): Promise<boolean> => {
        console.log({ userOne, userTwo })
        let friendship = await this.friendRepository.findOne({ where: { userOne, userTwo } });
        if (friendship?.FriendshipStatus === FriendshipStatus.ACCEPTED) {
            return true;
        }
        console.log(friendship)
        friendship = await this.friendRepository.findOne({ where: { userOne: userTwo, userTwo: userOne } });
        if (friendship?.FriendshipStatus === FriendshipStatus.ACCEPTED) {
            return true;
        }
        console.log(friendship)
        return false;
    }

    notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
        return value !== null && value !== undefined;
    }

}

export default UserService;