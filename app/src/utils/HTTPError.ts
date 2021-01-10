import { HTTPStatus } from "./HTTPStatuses";

export class HTTPError extends Error {

    constructor(httpStatus: HTTPStatus) {
      super(httpStatus.publicErrorMessage);
      this.statusCode = httpStatus.statusCode
    }

    statusCode: number;

}
