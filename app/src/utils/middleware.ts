import * as express from 'express';
import Logger from './Logger'
import { HTTPError } from "./HTTPError";
import { HTTPMethods } from "../enums/HTTPMethods";
import { ServerErrorStatus } from "./HTTPStatuses";
import AuthService from '../services/AuthService';

export type HTTPHandler = (request: express.Request, response: express.Response, logger: Logger) => Promise<any>

export type Middleware = (handlerFunction: HTTPHandler) => HTTPHandler

export const initialiseRoute = (router: express.Router, httpMethod: HTTPMethods, controllerPath: string, resourcePath: string | RegExp, middlewareFunctions: Middleware[], handlerFunction: HTTPHandler) => {
    for (let index = middlewareFunctions.length - 1; index >= 0; index--) {
        handlerFunction = middlewareFunctions[index](handlerFunction);
    }
    const handler = wrapHandler(httpMethod, controllerPath, resourcePath, handlerFunction);
    switch(httpMethod) {
        case HTTPMethods.GET:
            router.get(resourcePath, handler);
            break;
        case HTTPMethods.POST:
            router.post(resourcePath, handler);
            break;
        case HTTPMethods.PUT:
            router.put(resourcePath, handler);
    };
};

export const wrapHandler = (httpMethod: HTTPMethods, controllerPath: string, resourcePath: string | RegExp, callback: HTTPHandler) => {
    return async (request: express.Request, response: express.Response) => {
        const logger = new Logger();
        try {
            await callback(request, response, logger)
            logger.access(`${httpMethod} ${controllerPath}${resourcePath} ${response.statusCode}`)
            return
        } catch (err) {
            if (err instanceof HTTPError) {
                response.status(err.statusCode)
                response.json({ error: err.message });
                if (!!err.internalLogData) {
                    logger.error(err.internalErrorMessage, err.internalLogData);
                } else {
                    logger.error(err.internalErrorMessage);
                }
                logger.access(`${httpMethod} ${controllerPath}${resourcePath} ${err.statusCode}`)
                return
            }
            const unhandledError = err as Error
            response.status(ServerErrorStatus.statusCode)
            response.json({ error: ServerErrorStatus.publicErrorMessage });
            logger.error(`${unhandledError.message}\n${unhandledError.stack}`);
            logger.access(`${httpMethod} ${controllerPath}${resourcePath} ${ServerErrorStatus.statusCode}`)
            return
        }
    }
};

export const validateFullAccessToken: Middleware =  (callback: HTTPHandler) => {
    return async (request: express.Request, response: express.Response, logger: Logger) => {
        AuthService.getInstance().validateFullAccessToken(request)
        await callback(request, response, logger)
    }
};

export const validateInitialAccessToken: Middleware =  (callback: HTTPHandler) => {
    return async (request: express.Request, response: express.Response, logger: Logger) => {
        AuthService.getInstance().validateInitialAccessToken(request)
        await callback(request, response, logger)
    }
};

