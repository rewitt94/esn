import * as express from 'express';
import BaseController from '../utils/BaseController';
import ValidationHelper from "../utils/ValidationHelper";
import Logger from "../utils/Logger";
import { HTTPMethods } from '../enums/HTTPMethods';
import { HTTPError } from '../utils/HTTPError';
import { BadRequestStatus } from '../utils/HTTPStatuses';
import { initialiseRoute, validateInitialAccessToken, validateFullAccessToken, HTTPHandler } from "../utils/middleware"
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';
import NotificationService from '../services/NotificationService';
import CreateUserRequest from '../requestbody/CreateUserRequest';
import LoginRequest from '../requestbody/LoginRequest';
import UpdateUserRequest from '../requestbody/UpdateUserRequest';
import UsernameObject from '../requestbody/UsernameObject';
import AcceptFriendshipRequest from '../requestbody/AcceptFriendshipRequest';
import { FriendshipStatus } from '../enums/FriendshipStatus';


class UsersController implements BaseController {

  public path = '/users';
  public router = express.Router();
  private userService = UserService.getInstance();
  private authService = AuthService.getInstance();
  private notificationService = NotificationService.getInstance();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes = () => {
    initialiseRoute(this.router, HTTPMethods.POST, this.path, "/", [], this.createUser);
    initialiseRoute(this.router, HTTPMethods.PUT, this.path, "/", [validateInitialAccessToken], this.editUser);
    initialiseRoute(this.router, HTTPMethods.GET, this.path, "/token", [validateInitialAccessToken], this.getFullAccessToken);
    initialiseRoute(this.router, HTTPMethods.POST, this.path, "/login", [], this.login);
    initialiseRoute(this.router, HTTPMethods.GET, this.path, "/user/:userId", [validateFullAccessToken], this.getUser);
    initialiseRoute(this.router, HTTPMethods.GET, this.path, "/friends", [validateFullAccessToken], this.getFriends);
    initialiseRoute(this.router, HTTPMethods.POST, this.path, "/friends", [validateFullAccessToken], this.addFriend);
    initialiseRoute(this.router, HTTPMethods.PUT, this.path, "/friends", [validateFullAccessToken], this.acceptFriend);
  }

  createUser: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const createUserRequest = new CreateUserRequest(request.body);
    await ValidationHelper.validateRequestBody(createUserRequest);
    let user = createUserRequest.toNewUser();
    await ValidationHelper.validateEntity(user);
    await this.userService.insertUser(user);
    user = user.removePrivateData();
    response.status(201);
    response.json(user);
  }

  editUser: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const updateUserRequest = new UpdateUserRequest(request.body);
    await ValidationHelper.validateRequestBody(updateUserRequest);
    const userId = this.authService.getUserId(request);
    const user = updateUserRequest.toUser(userId);
    await this.userService.updateUser(user);
    response.status(200);
    response.json(user);
  }

  getFullAccessToken: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const userId = this.authService.getUserId(request);
    const user = await this.userService.getUser(userId);
    this.authService.validateUserHasFullAccess(user);
    const accessToken = this.authService.createFullAccessToken(user);
    response.status(200);
    response.json({ accessToken });
  }

  login: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const loginRequest = new LoginRequest(request.body);
    await ValidationHelper.validateRequestBody(loginRequest);
    const user = await this.userService.login(loginRequest);
    const userHasFullAccess = this.authService.checkUserHasFullAccess(user);
    let accessToken;
    if (userHasFullAccess) {
      accessToken = this.authService.createFullAccessToken(user);
    } else {
      accessToken = this.authService.createInitialAccessToken(user);
    }
    response.status(200);
    response.json({ accessToken });
  }

  getFriends: HTTPHandler = async (request: express.Request, response: express.Response) => {
    if (request.query.status === FriendshipStatus.REQUESTED) {
      const userId = this.authService.getUserId(request);
      const friends = await this.userService.getFriendRequests(userId);
      response.status(200);
      response.json(friends);
      return;
    };
    if (request.query.status === FriendshipStatus.ACCEPTED) {
      const userId = this.authService.getUserId(request);
      const friendRequests = await this.userService.getFriends(userId);
      response.status(200);
      response.json(friendRequests);
      return;
    }
    throw new HTTPError(BadRequestStatus, 'getFriends - method must contain expected status query parameter');
  }

  addFriend: HTTPHandler = async (request: express.Request, response: express.Response, logger: Logger) => {
    const usernameObject = new UsernameObject(request.body);
    await ValidationHelper.validateRequestBody(usernameObject);
    const { username } = usernameObject;
    const inviteeId = await this.userService.usernameToId(username);
    const senderUserId = this.authService.getUserId(request);
    logger.info('addFriend - attempting to add friend', { senderUserId, inviteeId })
    await this.userService.addFriend(inviteeId, senderUserId, logger);
    logger.info('addFriend - friend request sent, attempting to send notifications')
    await this.notificationService.sendAddFriendNotification(inviteeId, senderUserId);
    response.status(201);
    response.json({ message: "Friend request sent" });
  }

  acceptFriend: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const acceptFriendshipRequest = new AcceptFriendshipRequest(request.body);
    await ValidationHelper.validateRequestBody(acceptFriendshipRequest);
    const { username } = acceptFriendshipRequest;
    const acceptedUserId = await this.userService.usernameToId(username);
    const inviteeId = this.authService.getUserId(request);
    await this.userService.acceptFriend(inviteeId, acceptedUserId);
    await this.notificationService.sendAcceptFriendNotification(inviteeId, acceptedUserId);
    response.status(200);
    response.json({ message: "Friend request accepted" });
  }

  getUser: HTTPHandler = async (request: express.Request, response: express.Response, logger: Logger) => {
    const targetUser = request.params.userId;
    ValidationHelper.validateUuid(targetUser);
    const user = await this.userService.getUser(targetUser);
    user.removePrivateData();
    const requestingUser = this.authService.getUserId(request);
    await this.authService.validateUserIsVisible(requestingUser, targetUser);
    response.status(200);
    response.json(user);
  }

}

export default UsersController;