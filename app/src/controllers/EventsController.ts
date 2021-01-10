import * as express from 'express';
import CreateInviteEventRequest from '../requestbody/CreateInviteEventRequest';
import CreateCommunityEventRequest from '../requestbody/CreateCommunityEventRequest';
import BaseController from '../utils/BaseController';
import ValidationHelper from "../utils/ValidationHelper";
import { initialiseRoute, errorHandleHTTPHandler, validateAccessToken, HTTPHandler } from "../utils/middleware"
import AuthService from '../services/AuthService';
import EventService from '../services/EventService';
import { HTTPMethods } from '../enums/HTTPMethods';
import EventInviteRequest from '../requestbody/EventInviteRequest';
import NotificationService from '../services/NotificationService';
import CommuntiyService from '../services/CommunityService';
import Event from '../entities/Event';
import UpdateEventRequest from '../requestbody/UpdateEventRequest';
import UpdateAttendanceRequest from '../requestbody/UpdateAttendanceRequest';

class EventsController implements BaseController {

  public path = '/events';
  public router = express.Router();
  private eventService = EventService.getInstance();
  private communitityService = CommuntiyService.getInstance();
  private authService = AuthService.getInstance();
  private notificationService = NotificationService.getInstance();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes = () => {
    initialiseRoute(this.router, HTTPMethods.GET, "/", [errorHandleHTTPHandler, validateAccessToken], this.getEvents);
    initialiseRoute(this.router, HTTPMethods.POST, "/invite-event", [errorHandleHTTPHandler, validateAccessToken], this.createInviteEvent);
    initialiseRoute(this.router, HTTPMethods.POST, "/community-event", [errorHandleHTTPHandler, validateAccessToken], this.createCommunityEvent);
    initialiseRoute(this.router, HTTPMethods.POST, "/invite", [errorHandleHTTPHandler, validateAccessToken], this.createInvitesToEvent);
    initialiseRoute(this.router, HTTPMethods.PUT, "/", [errorHandleHTTPHandler, validateAccessToken], this.editEvent);
    initialiseRoute(this.router, HTTPMethods.PUT, "/attendance", [errorHandleHTTPHandler, validateAccessToken], this.editAttendance);
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
    response.json({ outcome: "users invited to event" });
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

  // createCommunityEventAttendance

  editAttendance: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const updateAttendanceRequest = new UpdateAttendanceRequest(request.body);
    await ValidationHelper.validateRequestBody(updateAttendanceRequest);
    const userId = this.authService.getUserId(request);
    await this.eventService.updateAttendance(userId, updateAttendanceRequest.event, updateAttendanceRequest.attendanceType);
    const event = await this.eventService.getEvent(updateAttendanceRequest.event);
    await this.notificationService.sendEventAttendanceNotification(userId, event.creator, event.id);
    response.status(200);
    response.json({ attendance: updateAttendanceRequest.attendanceType });
  }

}

export default EventsController;