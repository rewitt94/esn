import * as express from 'express';
import { mock } from "jest-mock-extended";
import { errorHandleHTTPHandler } from "../../src/utils/middleware";
import { HTTPError } from "../../src/utils/HTTPError";
import { ServerErrorStatus } from "../../src/utils/HTTPStatuses";

describe("middleware", () => {

    describe("errorHandleHTTPHandler", () => {

        it("no impact if no error is thrown", async () => {

            const httpHandler = async (request: express.Request, response: express.Response): Promise<any> => {
                response.status(201);
                response.json({ message: "helloworld" })
            }

            const wrappedHandler = errorHandleHTTPHandler(httpHandler);

            const mockedRequest = mock<express.Request>();
            const mockedResponse = mock<express.Response>();

            await wrappedHandler(mockedRequest, mockedResponse);

            expect(mockedResponse.status).toHaveBeenCalledWith(201);
            expect(mockedResponse.json).toHaveBeenCalledWith({ message: "helloworld" })

        });

        it("returns http status error if thrown", async () => {

            const httpHandler = async (request: express.Request, response: express.Response): Promise<any> => {
                throw new HTTPError({
                    statusCode: 504,
                    publicErrorMessage: "gateway timed out"
                })
            }

            const wrappedHandler = errorHandleHTTPHandler(httpHandler);

            const mockedRequest = mock<express.Request>();
            const mockedResponse = mock<express.Response>();

            await wrappedHandler(mockedRequest, mockedResponse);

            expect(mockedResponse.status).toHaveBeenCalledWith(504);
            expect(mockedResponse.json).toHaveBeenCalledWith({ error: "gateway timed out" })

        });

        it("returns internal server error if http status error is unknown", async () => {

            const httpHandler = async (request: express.Request, response: express.Response): Promise<any> => {
                throw new Error("panic")
            }

            const wrappedHandler = errorHandleHTTPHandler(httpHandler);

            const mockedRequest = mock<express.Request>();
            const mockedResponse = mock<express.Response>();

            await wrappedHandler(mockedRequest, mockedResponse);

            expect(mockedResponse.status).toHaveBeenCalledWith(ServerErrorStatus.statusCode);
            expect(mockedResponse.json).toHaveBeenCalledWith({ error: ServerErrorStatus.publicErrorMessage })

        });

    });

});