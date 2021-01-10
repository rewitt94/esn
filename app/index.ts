import App from './src/utils/App';
import UsersController from './src/controllers/UsersController';
import NotificationsController from './src/controllers/NotificationsController';
import EnvVars from "./src/utils/EnvVars";
import { createConnection } from "typeorm";
import EventsController from './src/controllers/EventsController';
import CommunitiesController from './src/controllers/CommunitiesController';

(async function main() {

  // create db connection
  await createConnection();

  // create web app
  const port = parseInt(EnvVars.get().valueOf("WEB_APP_PORT"), 10)
  const app = new App(
    [
      new UsersController(),
      new EventsController(),
      new CommunitiesController(),
      new NotificationsController()
    ],
    port
  );

  // start web app
  app.listen();

})();

