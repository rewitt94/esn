import typeorm, { getRepository } from "typeorm";
import bcrypt from "bcrypt";
import User from '../entities/User';
import Friendship from '../entities/Friendship';
import LoginRequest from "../requestbody/LoginRequest";
import { BadRequestStatus, ConflictStatus, ForbiddenStatus, UnauthorizedStatus } from "../utils/HTTPStatuses";
import { HTTPError } from "../utils/HTTPError";
import MappingEntityFactory from "../factories/MappingEntityFactory";
import { FriendshipType } from "../enums/FriendshipType";

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

    saveUser = async (user: User): Promise<void> => {
        const existingUser = await this.userRepository.findOne({ where: { username: user.username } });
        if (!!existingUser) {
            throw new HTTPError(ConflictStatus);
        }
        await this.userRepository.save(user);
    };

    login = async (login: LoginRequest): Promise<User> => {
        const user = await this.userRepository.findOne({ where: { username: login.username } });
        if (!user) {
            throw new HTTPError(UnauthorizedStatus);
        }
        const success = bcrypt.compareSync(login.password, user.hashedPassword!);
        if (!success) {
            throw new HTTPError(UnauthorizedStatus);
        }
        return user;
    };

    getUser = async (userId: string): Promise<User> => {
       const user = await this.userRepository.findOne({ where: { id: userId } });
       if (user === undefined) {
           throw new HTTPError(ForbiddenStatus);
       }
       return user;
    }

    updateUser = async (user: User): Promise<void> => {
        await this.userRepository.update(user.id, user);
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
            throw new HTTPError(BadRequestStatus);
        }
        return user.id;
    }

    addFriend = async (inviteeId: string, requesterId: string): Promise<void> => {
        if (inviteeId === requesterId) {
            throw new HTTPError(BadRequestStatus);
        }
        const existingFriendship = await this.friendRepository.findOne({ where: { userOne: inviteeId, userTwo: requesterId } });
        if (!!existingFriendship) {
            throw new HTTPError(ConflictStatus);
        }
        const existingFriendshipInverse = await this.friendRepository.findOne({ where: { userOne: requesterId, userTwo: inviteeId } });
        if (!!existingFriendshipInverse) {
            throw new HTTPError(ConflictStatus);
        }
        const friendship = MappingEntityFactory.makeRequestedFriendship(inviteeId, requesterId);
        await this.userRepository.save(friendship);
    };

    friendInviteExists = async (inviteeId: string, requesterId: string) : Promise<boolean> => {
        const friendship = await this.friendRepository.findOne({ where: { userOne: inviteeId, userTwo: requesterId } });
        return !!friendship && friendship.friendshipType === FriendshipType.REQUESTED;
    }

    acceptFriend = async (inviteeId: string, requesterId: string): Promise<void> => {
        const existingFriendship = await this.friendRepository.findOne({ where: { userOne: inviteeId, userTwo: requesterId } });
        if (!!existingFriendship) {
            if (existingFriendship.friendshipType === FriendshipType.ACCEPTED) {
                throw new HTTPError(ConflictStatus);
            }
            existingFriendship.friendshipType = FriendshipType.ACCEPTED;
            await this.friendRepository.update(existingFriendship.id, existingFriendship);
            return;
        }
        throw new HTTPError(BadRequestStatus);
    };

    getFriends =  async (userId: string): Promise<User[]> => {
        let friendships: Friendship[] = [];
        friendships = friendships.concat(await this.friendRepository.find({ where: { userOne: userId } }));
        friendships = friendships.concat(await this.friendRepository.find({ where: { userTwo: userId } }));
        friendships.filter(friendship => friendship.friendshipType === FriendshipType.ACCEPTED);
        const promises = friendships.map(async friendship => {
            if (friendship.userOne === userId) {
                return await this.userRepository.findOne(friendship.userTwo);
            }
            return await this.userRepository.findOne(friendship.userOne);
        });
        const friends = await Promise.all(promises).catch(err => { throw err })
        return friends.filter(this.notEmpty);
    };

    getFriendRequests =  async (userId: string): Promise<User[]> => {
        const friendRequests = await this.friendRepository.find({ where: { userTwo: userId } });
        friendRequests.filter(friendship => friendship.friendshipType === FriendshipType.REQUESTED);
        const promises = friendRequests.map(async friendRequest => {
            return await this.userRepository.findOne(friendRequest.userOne);
        });
        const friends = await Promise.all(promises).catch(err => { throw err })
        return friends.filter(this.notEmpty);
    };

    areFriends = async (userOne: string, userTwo: string): Promise<boolean> => {
        let friendship = await this.friendRepository.findOne({ where: { userOne, userTwo } });
        if (friendship?.friendshipType === FriendshipType.ACCEPTED) {
            return true;
        }
        friendship = await this.friendRepository.findOne({ where: { userOne: userTwo, userTwo: userOne } });
        if (friendship?.friendshipType === FriendshipType.ACCEPTED) {
            return true;
        }
        return false;
    }

    notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
        return value !== null && value !== undefined;
    }

}

export default UserService;