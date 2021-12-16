import express from 'express';
import bodyParser from 'body-parser';
import BaseController from './BaseController';
import Logger from './Logger';
import { BadRequestStatus } from './HTTPStatuses';

class App {

  private app: express.Application;
  private port: number;

  constructor (controllers: BaseController[], port: number) {
    this.app = express();
    this.port = port;
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  private initializeMiddlewares = (): void => {
    this.app.use(bodyParser.json());
    this.app.use((error: Error, request: express.Request, response: express.Response, next: express.NextFunction) => {
      if (error instanceof SyntaxError) {
        const logger = new Logger();
        logger.error('Could not parse JSON request body', request.body)
        logger.access(`${request.method} ${request.url} ${BadRequestStatus.statusCode}`)
        response.status(BadRequestStatus.statusCode)
        response.json({ error: BadRequestStatus.publicErrorMessage });
      } else {
        next();
      }
    });
  }

  private initializeControllers = (controllers: BaseController[]): void => {
    controllers.forEach((controller) => {
      this.app.use(controller.path, controller.router);
    });
  }

  public listen = (): void => {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }

}

export default App;