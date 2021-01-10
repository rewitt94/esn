import * as express from 'express';
import BaseController from '../utils/BaseController';
import { initialiseRoute, errorHandleHTTPHandler, validateAccessToken, HTTPHandler } from "../utils/middleware"
import { HTTPMethods } from '../enums/HTTPMethods';
import NotificationService from '../services/NotificationService';
import AuthService from '../services/AuthService';

class NotificationsController implements BaseController {

  public path = '/notifications';
  public router = express.Router();
  private notificationService = NotificationService.getInstance();
  private authService = AuthService.getInstance();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes = () => {
    initialiseRoute(this.router, HTTPMethods.GET, "/", [errorHandleHTTPHandler, validateAccessToken], this.getNotifications);
  }

  getNotifications: HTTPHandler = async (request: express.Request, response: express.Response) => {
    const userId = this.authService.getUserId(request);
    const notifications = this.notificationService.getNotifcationsForUser(userId);
    response.status(200);
    response.json(notifications);
  }

}

export default NotificationsController;