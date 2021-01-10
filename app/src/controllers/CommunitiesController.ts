import * as express from 'express';
import BaseController from '../utils/BaseController';
import ValidationHelper from "../utils/ValidationHelper";
import { errorHandleHTTPHandler, HTTPHandler, initialiseRoute, validateAccessToken } from "../utils/middleware"
import AuthService from '../services/AuthService';
import CommunityService from '../services/CommunityService';
import CreateCommunityRequest from '../requestbody/CreateCommunityRequest';
import CommunityObject from '../requestbody/CommunityObject';
import MappingEntityFactory from '../factories/MappingEntityFactory';
import { HTTPMethods } from '../enums/HTTPMethods';
import CommunityInviteRequest from '../requestbody/CommunityInviteRequest';
import NotificationService from '../services/NotificationService';

class CommunitiesController implements BaseController {

  public path = '/communities';
  public router = express.Router();
  private communityService = CommunityService.getInstance();
  private authService = AuthService.getInstance();
  private notificationService = NotificationService.getInstance();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes = () => {
    initialiseRoute(this.router, HTTPMethods.GET, "/:communityId", [errorHandleHTTPHandler, validateAccessToken], this.getCommunity);
    initialiseRoute(this.router, HTTPMethods.POST, "/", [errorHandleHTTPHandler, validateAccessToken], this.createCommunity);
    initialiseRoute(this.router, HTTPMethods.POST, "/invite", [errorHandleHTTPHandler, validateAccessToken], this.inviteToCommunity);
    initialiseRoute(this.router, HTTPMethods.POST, "/accept", [errorHandleHTTPHandler, validateAccessToken], this.acceptInviteToCommunity);
    initialiseRoute(this.router, HTTPMethods.PUT, "/", [errorHandleHTTPHandler, validateAccessToken], this.editCommunity);
  }

  getCommunity: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const targetCommunity = request.params.communityId;
    ValidationHelper.validateUuid(targetCommunity);
    const community = await this.communityService.getCommunity(targetCommunity);
    const requestingUser = this.authService.getUserId(request);
    this.authService.validateCommunityIsVisible(requestingUser, targetCommunity);
    response.status(200);
    response.json(community);
  }

  createCommunity: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const createCommunityRequest = new CreateCommunityRequest(request.body);
    await ValidationHelper.validateRequestBody(createCommunityRequest);
    const community = createCommunityRequest.toNewCommunity();
    await ValidationHelper.validateEntity(community);
    const userId = this.authService.getUserId(request);
    const adminMembership = MappingEntityFactory.makeAdminMembership(community.id, userId);
    await this.communityService.saveCommunity(community);
    await this.communityService.saveMemberships([adminMembership]);
    response.status(201);
    response.json(community);
  }

  inviteToCommunity: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const communityInviteRequest = new CommunityInviteRequest(request.body);
    await ValidationHelper.validateRequestBody(communityInviteRequest);
    const userId = this.authService.getUserId(request);
    await this.authService.validateUserIsCommunityAdmin(userId, communityInviteRequest.community);
    await this.authService.validateInviteesAreFriends(userId, communityInviteRequest.invitees);
    await this.communityService.inviteUsersToCommunity(communityInviteRequest.community, communityInviteRequest.invitees);
    await this.notificationService.sendCommunityInviteNotifications(communityInviteRequest.community, communityInviteRequest.invitees, userId);
    response.status(201);
    response.json({ outcome: "users invited to community" });
  }

  acceptInviteToCommunity: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const communityObject = new CommunityObject(request.body);
    await ValidationHelper.validateRequestBody(communityObject);
    const { community } = communityObject;
    const userId = this.authService.getUserId(request);
    await this.communityService.acceptMembership(userId, community);
    await this.notificationService.sendAcceptCommunityNotification(userId, community);
    response.status(200);
    response.json({ message: "Friend request accepted" });
  }

  editCommunity: HTTPHandler = async (request: express.Request, response: express.Response) => {

  }

}

export default CommunitiesController;