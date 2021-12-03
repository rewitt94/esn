import { HTTPStatus } from "./HTTPStatuses";

export class HTTPError extends Error {

    constructor(httpStatus: HTTPStatus, internalErrorMessage: string, internalLogData?: object) {
      super(httpStatus.publicErrorMessage);
      this.internalErrorMessage = internalErrorMessage;
      this.internalLogData = internalLogData;
      this.statusCode = httpStatus.statusCode;
    }

    statusCode: number;
    internalErrorMessage: string;
    internalLogData?: object;
}
