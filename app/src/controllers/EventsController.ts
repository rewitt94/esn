import * as express from 'express';
import BaseController from '../utils/BaseController';
import ValidationHelper from "../utils/ValidationHelper";
import { HTTPMethods } from '../enums/HTTPMethods';
import { HTTPError } from '../utils/HTTPError';
import { ForbiddenStatus } from '../utils/HTTPStatuses';
import { initialiseRoute, validateFullAccessToken, HTTPHandler } from "../utils/middleware"
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';
import EventService from '../services/EventService';
import NotificationService from '../services/NotificationService';
import CommuntiyService from '../services/CommunityService';
import Event from '../entities/Event';
import EventInviteRequest from '../requestbody/EventInviteRequest';
import CreateInviteEventRequest from '../requestbody/CreateInviteEventRequest';
import CreateCommunityEventRequest from '../requestbody/CreateCommunityEventRequest';
import UpdateEventRequest from '../requestbody/UpdateEventRequest';
import UpdateAttendanceRequest from '../requestbody/UpdateAttendanceRequest';
import CreateCommunityEventAttendanceRequest from '../requestbody/CreateCommunityEventAttendanceRequest';


class EventsController implements BaseController {

  public path = '/events';
  public router = express.Router();
  private eventService = EventService.getInstance();
  private communitityService = CommuntiyService.getInstance();
  private userService = UserService.getInstance();
  private authService = AuthService.getInstance();
  private notificationService = NotificationService.getInstance();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes = () => {
    initialiseRoute(this.router, HTTPMethods.GET, this.path, "/", [validateFullAccessToken], this.getEvents);
    initialiseRoute(this.router, HTTPMethods.GET, this.path, "/:eventId", [validateFullAccessToken], this.getEvent);
    initialiseRoute(this.router, HTTPMethods.GET, this.path, "/:eventId/attendance", [validateFullAccessToken], this.getEventAttendance);
    initialiseRoute(this.router, HTTPMethods.POST, this.path, "/invite-event", [validateFullAccessToken], this.createInviteEvent);
    initialiseRoute(this.router, HTTPMethods.POST, this.path, "/community-event", [validateFullAccessToken], this.createCommunityEvent);
    initialiseRoute(this.router, HTTPMethods.POST, this.path, "/invite", [validateFullAccessToken], this.createInvitesToEvent);
    initialiseRoute(this.router, HTTPMethods.POST, this.path, "/attendance", [validateFullAccessToken], this.createCommunityEventAttendance);
    initialiseRoute(this.router, HTTPMethods.PUT, this.path, "/", [validateFullAccessToken], this.editEvent);
    initialiseRoute(this.router, HTTPMethods.PUT, this.path, "/attendance", [validateFullAccessToken], this.editAttendance);
  }

  getEvents: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const userId = this.authService.getUserId(request);
    let events: Event[] = [];
    events = events.concat(await this.eventService.getInviteEventsForUser(userId));
    const communityIds = await this.communitityService.getUsersCommunityIds(userId);
    for (const communityId of communityIds) {
      events = events.concat(await this.eventService.getEventsForCommunity(communityId));
    }
    response.status(200);
    response.json(events);
  }

  getEvent: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const eventId = request.params.eventId;
    ValidationHelper.validateUuid(eventId);
    const event = await this.eventService.getEvent(eventId);
    const requestingUser = this.authService.getUserId(request);
    this.authService.validateEventIsVisible(requestingUser, eventId);
    response.status(200);
    response.json(event);
  }

  getEventAttendance: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const eventId = request.params.eventId;
    ValidationHelper.validateUuid(eventId);
    const requestingUser = this.authService.getUserId(request);
    this.authService.validateEventIsVisible(requestingUser, eventId);
    const attendances = await this.eventService.getAttendances(eventId);
    const promises = attendances.map(async attendance => {
      const user = await this.userService.getUser(attendance.user);
      return {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        attendance: attendance.AttendanceStatus,
        attendanceUpdated: attendance.lastUpdated
      };
    })
    const attendees = await Promise.all(promises);
    response.status(200);
    response.json(attendees);
  }

  createCommunityEvent = async (request: express.Request, response: express.Response) => {
    const createEventRequest = new CreateCommunityEventRequest(request.body);
    const userId = this.authService.getUserId(request);
    const event = createEventRequest.toNewEvent(userId);
    await ValidationHelper.validateEntity(event);
    await this.authService.validateMembership(userId, event.community)
    await this.eventService.saveEvent(event);
    await this.notificationService.sendCommunityEventNotficiations(event.community, event.id);
    response.status(201);
    response.json(event);
  }

  createInviteEvent = async (request: express.Request, response: express.Response) => {
    const createEventRequest = new CreateInviteEventRequest(request.body);
    await ValidationHelper.validateRequestBody(createEventRequest);
    const userId = this.authService.getUserId(request);
    const event = createEventRequest.toNewEvent(userId);
    await ValidationHelper.validateEntity(event);
    if (Array.isArray(createEventRequest.invitees) && createEventRequest.invitees.length) {
      await this.authService.validateInviteesAreFriends(userId, createEventRequest.invitees);
      await this.eventService.saveEvent(event);
      await this.eventService.inviteUsersToEvent(event.id, createEventRequest.invitees);
      await this.notificationService.sendEventInviteNotifications(event.id, createEventRequest.invitees, userId)
    } else {
      await this.eventService.saveEvent(event);
    }
    response.status(201);
    response.json(event);
  }

  createInvitesToEvent: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const eventInviteRequest = new EventInviteRequest(request.body);
    await ValidationHelper.validateRequestBody(eventInviteRequest);
    const userId = this.authService.getUserId(request);
    await this.authService.validateUserCanInviteToEvent(eventInviteRequest.event, userId);
    await this.authService.validateInviteesAreFriends(userId, eventInviteRequest.invitees);
    await this.eventService.inviteUsersToEvent(eventInviteRequest.event, eventInviteRequest.invitees);
    await this.notificationService.sendEventInviteNotifications(eventInviteRequest.event, eventInviteRequest.invitees, userId);
    response.status(201);
    response.json({ messages: "Event invites sent" });
  }

  editEvent: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const updateEventRequest = new UpdateEventRequest(request.body);
    await ValidationHelper.validateRequestBody(updateEventRequest);
    const userId = this.authService.getUserId(request);
    await this.authService.validateUserIsEventCreator(updateEventRequest.event, userId);
    const event = updateEventRequest.toEvent();
    await this.eventService.updateEvent(event);
    await this.notificationService.sendEventUpdateNotifications(event);
    response.status(200);
    response.json(event);
  }

  createCommunityEventAttendance: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const createCommunityEventAttendanceRequest = new CreateCommunityEventAttendanceRequest(request.body);
    await ValidationHelper.validateRequestBody(createCommunityEventAttendanceRequest);
    const userId = this.authService.getUserId(request);
    const attendance = createCommunityEventAttendanceRequest.toNewAttendance(userId);
    await ValidationHelper.validateEntity(attendance);
    const event = await this.eventService.getEvent(createCommunityEventAttendanceRequest.event);
    if (event.community === undefined) {
      throw new HTTPError(ForbiddenStatus, 'createCommunityEventAttendance - cannot create community attendance if event has no community', { event })
    }
    await this.authService.validateMembership(userId, event.community);
    await this.eventService.createAttendance(attendance);
    await this.notificationService.sendEventAttendanceNotification(userId, event.creator, event.id);
    response.status(201);
    response.json({ attendance: createCommunityEventAttendanceRequest.AttendanceStatus });
  }

  editAttendance: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const updateAttendanceRequest = new UpdateAttendanceRequest(request.body);
    await ValidationHelper.validateRequestBody(updateAttendanceRequest);
    const userId = this.authService.getUserId(request);
    await this.eventService.updateAttendance(userId, updateAttendanceRequest.event, updateAttendanceRequest.AttendanceStatus);
    const event = await this.eventService.getEvent(updateAttendanceRequest.event);
    await this.notificationService.sendEventAttendanceNotification(userId, event.creator, event.id);
    response.status(200);
    response.json({ attendance: updateAttendanceRequest.AttendanceStatus });
  }

}

export default EventsController;