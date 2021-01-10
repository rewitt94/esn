import * as express from 'express';
import { HTTPError } from "./HTTPError";
import { HTTPMethods } from "../enums/HTTPMethods";
import { ServerErrorStatus } from "./HTTPStatuses";
import AuthService from '../services/AuthService';

export type HTTPHandler = (request: express.Request, response: express.Response) => Promise<any>

export type Middleware = (handlerFunction: HTTPHandler) => HTTPHandler

export const initialiseRoute = (router: express.Router, httpMethod: HTTPMethods, path: string | RegExp, middlewareFunctions: Middleware[], handlerFunction: HTTPHandler) => {
    let handler: HTTPHandler = middlewareFunctions[middlewareFunctions.length - 1](handlerFunction)
    for (let index = middlewareFunctions.length - 2; index >= 0; index--) {
        handler = middlewareFunctions[index](handler);
    }
    switch(httpMethod) {
        case HTTPMethods.GET:
            router.get(path, handler);
            break;
        case HTTPMethods.POST:
            router.post(path, handler);
            break;
        case HTTPMethods.PUT:
            router.put(path, handler);
    };
};

export const errorHandleHTTPHandler: Middleware = (callback: HTTPHandler) => {
    return async (request: express.Request, response: express.Response) => {
        try {
            await callback(request, response)
        } catch (err) {
            if (err instanceof HTTPError) {
                response.status(err.statusCode)
                response.json({ error: err.message });
                return response;
            }
            response.status(ServerErrorStatus.statusCode)
            response.json({ error: ServerErrorStatus.publicErrorMessage });
            return response;
        }
    }
};

export const validateAccessToken: Middleware =  (callback: HTTPHandler) => {
    return async (request: express.Request, response: express.Response) => {
        AuthService.getInstance().validateAccessToken(request)
        await callback(request, response)
    }
};