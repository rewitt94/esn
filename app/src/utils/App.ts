import express from 'express';
import bodyParser from 'body-parser';
import BaseController from './BaseController';

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