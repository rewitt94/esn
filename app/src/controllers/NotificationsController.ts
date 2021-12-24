import * as express from 'express';
import BaseController from '../utils/BaseController';
import { HTTPMethods } from '../enums/HTTPMethods';
import { initialiseRoute, validateFullAccessToken, HTTPHandler } from "../utils/middleware"
import NotificationService from '../services/NotificationService';
import AuthService from '../services/AuthService';
import Logger from '../utils/Logger';

class NotificationsController implements BaseController {

  public path = '/notifications';
  public router = express.Router();
  private notificationService = NotificationService.getInstance();
  private authService = AuthService.getInstance();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes = () => {
    initialiseRoute(this.router, HTTPMethods.GET, this.path, "/", [validateFullAccessToken], this.getNotifications);
  }

  getNotifications: HTTPHandler = async (request: express.Request, response: express.Response, logger: Logger) => {
    const userId = this.authService.getUserId(request);
    const notifications = await this.notificationService.getNotifcationsForUser(userId, logger);
    response.status(200);
    response.json(notifications.sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()));
  }

}

export default NotificationsController;