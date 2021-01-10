import * as express from 'express';
import CreateUserRequest from '../requestbody/CreateUserRequest';
import LoginRequest from '../requestbody/LoginRequest';
import UpdateUserRequest from '../requestbody/UpdateUserRequest';
import UsernameObject from '../requestbody/UsernameObject';
import UserService from '../services/UserService';
import BaseController from '../utils/BaseController';
import ValidationHelper from "../utils/ValidationHelper";
import { initialiseRoute, errorHandleHTTPHandler, validateAccessToken, HTTPHandler } from "../utils/middleware"
import AuthService from '../services/AuthService';
import { HTTPMethods } from '../enums/HTTPMethods';
import NotificationService from '../services/NotificationService';

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
    initialiseRoute(this.router, HTTPMethods.GET, "/:userId", [errorHandleHTTPHandler, validateAccessToken], this.editUser);
    initialiseRoute(this.router, HTTPMethods.POST, "/", [errorHandleHTTPHandler], this.createUser);
    initialiseRoute(this.router, HTTPMethods.POST, "/login", [errorHandleHTTPHandler], this.login);
    initialiseRoute(this.router, HTTPMethods.PUT, "/", [errorHandleHTTPHandler, validateAccessToken], this.editUser);
    initialiseRoute(this.router, HTTPMethods.GET, "/friends", [errorHandleHTTPHandler, validateAccessToken], this.getFriends);
    initialiseRoute(this.router, HTTPMethods.POST, "/add", [errorHandleHTTPHandler, validateAccessToken], this.addFriend);
    initialiseRoute(this.router, HTTPMethods.POST, "/accept", [errorHandleHTTPHandler, validateAccessToken], this.acceptFriend);
  }

  getUser: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const targetUser = request.params.userId;
    ValidationHelper.validateUuid(targetUser);
    const user = await this.userService.getUser(targetUser);
    const requestingUser = this.authService.getUserId(request);
    await this.authService.validateUserIsVisible(requestingUser, targetUser);
    response.status(200);
    response.json(user);
  }

  createUser: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const createUserRequest = new CreateUserRequest(request.body);
    await ValidationHelper.validateRequestBody(createUserRequest);
    const user = createUserRequest.toNewUser();
    await ValidationHelper.validateEntity(user);
    await this.userService.saveUser(user);
    delete user.hashedPassword;
    response.status(201);
    response.json(user);
  }

  editUser: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const updateUserRequest = new UpdateUserRequest(request.body);
    await ValidationHelper.validateRequestBody(updateUserRequest);
    const user = updateUserRequest.toUser();
    user.id = this.authService.getUserId(request);
    this.userService.updateUser(user);
    response.status(200);
    response.json(user);
  }

  login: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const loginRequest = new LoginRequest(request.body);
    await ValidationHelper.validateRequestBody(loginRequest);
    const user = await this.userService.login(loginRequest);
    const accessToken = this.authService.createAccessToken(user);
    response.status(200);
    response.json({ accessToken });
  }

  getFriends: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const userId = this.authService.getUserId(request);
    const friends = await this.userService.getFriends(userId);
    response.status(200);
    response.json(friends);
  }

  addFriend: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const usernameObject = new UsernameObject(request.body);
    await ValidationHelper.validateRequestBody(usernameObject);
    const { username } = usernameObject;
    const inviteeId = await this.userService.usernameToId(username);
    const senderUserId =  this.authService.getUserId(request);
    await this.userService.addFriend(inviteeId, senderUserId);
    await this.notificationService.sendAddFriendNotification(inviteeId, senderUserId);
    response.status(200);
    response.json({ message: "Friend request sent" });
  }

  acceptFriend: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const usernameObject = new UsernameObject(request.body);
    await ValidationHelper.validateRequestBody(usernameObject);
    const { username } = usernameObject;
    const acceptedUserId = await this.userService.usernameToId(username);
    const inviteeId = this.authService.getUserId(request);
    await this.userService.acceptFriend(inviteeId, acceptedUserId);
    await this.notificationService.sendAcceptFriendNotification(inviteeId, acceptedUserId);
    response.status(200);
    response.json({ message: "Friend request accepted" });
  }

}

export default UsersController;