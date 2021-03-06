import * as express from 'express';
import BaseController from '../utils/BaseController';
import ValidationHelper from "../utils/ValidationHelper";
import { HTTPMethods } from '../enums/HTTPMethods';
import { HTTPHandler, initialiseRoute, validateFullAccessToken } from "../utils/middleware"
import AuthService from '../services/AuthService';
import CommunityService from '../services/CommunityService';
import UserService from '../services/UserService';
import MappingEntityFactory from '../factories/MappingEntityFactory';
import CommunityObject from '../requestbody/CommunityObject';
import CreateCommunityRequest from '../requestbody/CreateCommunityRequest';
import CommunityInviteRequest from '../requestbody/CommunityInviteRequest';
import NotificationService from '../services/NotificationService';
import UpdateCommunityRequest from '../requestbody/UpdateCommunityRequest';
import Logger from '../utils/Logger';

class CommunitiesController implements BaseController {

  public path = '/communities';
  public router = express.Router();
  private communityService = CommunityService.getInstance();
  private userService = UserService.getInstance();
  private authService = AuthService.getInstance();
  private notificationService = NotificationService.getInstance();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes = () => {
    initialiseRoute(this.router, HTTPMethods.POST, this.path, "/", [validateFullAccessToken], this.createCommunity);
    initialiseRoute(this.router, HTTPMethods.PUT, this.path, "/", [validateFullAccessToken], this.editCommunity);
    initialiseRoute(this.router, HTTPMethods.POST, this.path, "/membership", [validateFullAccessToken], this.inviteToCommunity);
    initialiseRoute(this.router, HTTPMethods.PUT, this.path, "/membership", [validateFullAccessToken], this.acceptInviteToCommunity);
    initialiseRoute(this.router, HTTPMethods.GET, this.path, "/", [validateFullAccessToken], this.getCommunities);
    initialiseRoute(this.router, HTTPMethods.GET, this.path, "/:communityId", [validateFullAccessToken], this.getCommunity);
    initialiseRoute(this.router, HTTPMethods.GET, this.path, "/:communityId/members", [validateFullAccessToken], this.getCommunityMembers);
  }

  createCommunity: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const createCommunityRequest = new CreateCommunityRequest(request.body);
    await ValidationHelper.validateRequestBody(createCommunityRequest);
    const community = createCommunityRequest.toNewCommunity();
    await ValidationHelper.validateEntity(community);
    const userId = this.authService.getUserId(request);
    const adminMembership = MappingEntityFactory.makeAdminMembership(community.id, userId);
    await this.communityService.insertCommunity(community);
    await this.communityService.saveMemberships([adminMembership]);
    response.status(201);
    response.json(community);
  }

  editCommunity: HTTPHandler = async (request: express.Request, response: express.Response, logger: Logger) => {
    const updateCommunityRequest = new UpdateCommunityRequest(request.body);
    await ValidationHelper.validateRequestBody(updateCommunityRequest);
    const userId = this.authService.getUserId(request);
    await this.authService.validateUserIsCommunityAdmin(userId, updateCommunityRequest.id);
    const community = updateCommunityRequest.toCommunity();
    await this.communityService.updateCommunity(community);
    await this.notificationService.sendCommunityUpdateNotifications(userId, community.id, logger);
    response.status(200);
    response.json(community);
  }

  inviteToCommunity: HTTPHandler = async (request: express.Request, response: express.Response, logger: Logger) => {
    const communityInviteRequest = new CommunityInviteRequest(request.body);
    await ValidationHelper.validateRequestBody(communityInviteRequest);
    const userId = this.authService.getUserId(request);
    await this.authService.validateUserIsCommunityAdmin(userId, communityInviteRequest.community);
    await this.authService.validateInviteesAreFriends(userId, communityInviteRequest.invitees);
    await this.communityService.inviteUsersToCommunity(communityInviteRequest.community, communityInviteRequest.invitees);
    await this.notificationService.sendCommunityInviteNotifications(communityInviteRequest.community, communityInviteRequest.invitees, userId, logger);
    response.status(201);
    response.json({ message: "Community invites sent" });
  }

  acceptInviteToCommunity: HTTPHandler = async (request: express.Request, response: express.Response, logger: Logger) => {
    const communityObject = new CommunityObject(request.body);
    await ValidationHelper.validateRequestBody(communityObject);
    const { community } = communityObject;
    const userId = this.authService.getUserId(request);
    await this.communityService.acceptMembership(userId, community);
    await this.notificationService.sendAcceptCommunityNotification(userId, community, logger);
    response.status(200);
    response.json({ message: "Community invite accepted" });
  }

  getCommunities: HTTPHandler = async (request: express.Request, response: express.Response, logger: Logger) => {
    const userId = this.authService.getUserId(request);
    const communities = await this.communityService.getCommunitiesForUser(userId, logger);
    response.status(200);
    response.json(communities);
  }

  getCommunity: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const communityId = request.params.communityId;
    ValidationHelper.validateUuid(communityId);
    const community = await this.communityService.getCommunity(communityId);
    const requestingUser = this.authService.getUserId(request);
    await this.authService.validateCommunityIsVisible(requestingUser, communityId);
    response.status(200);
    response.json(community);
  }

  getCommunityMembers: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const eventId = request.params.communityId;
    ValidationHelper.validateUuid(eventId);
    const requestingUser = this.authService.getUserId(request);
    await this.authService.validateCommunityIsVisible(requestingUser, eventId);
    const memberships = await this.communityService.getCommunityMemberships(eventId);
    const promises = memberships.map(async membership => {
      const user = await this.userService.getUser(membership.user);
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        membership: membership.membershipStatus,
      };
    })
    const members = await Promise.all(promises);
    response.status(200);
    response.json(members);
  }

}

export default CommunitiesController;