export abstract class HTTPEndpoint<RequestInfo, ResponseInfo, AssertSuccessValidationObject = {}> {

    abstract httpRequest(requestInfo: RequestInfo, headers?: object): Promise<HTTPApiMethodResponse<ResponseInfo>>;
    abstract assertSuccess(statusCode: number, responseBody: ResponseInfo, requestInfo: RequestInfo, validationObject?: AssertSuccessValidationObject): void;

    makeRequest = async (requestInfo: RequestInfo, headers?: object) => {
        const data = await this.httpRequest(requestInfo, headers);
        return new HTTPMethodResponse(data, requestInfo, this.assertSuccess);
    };

}

export interface ErrorResponse {
    error: string,
}

export interface HTTPApiMethodResponse<ResponseInfo> {
    statusCode: number,
    responseBody: ResponseInfo | ErrorResponse
}

class HTTPMethodResponse<RequestInfo, ResponseInfo, AssertSuccessValidationObject = {}> {

    public statusCode: number;
    private responseBody: ResponseInfo | ErrorResponse;
    private requestPayload: RequestInfo;
    private abstractAssertSuccess: (statusCode: number, responseBody: ResponseInfo, requestInfo: RequestInfo, validationObject?: AssertSuccessValidationObject) => void;
    
    constructor(data: any, requestPayload: any, abstractAssertSuccess: (statusCode: number, responseBody: ResponseInfo, requestInfo: RequestInfo, validationObject?: AssertSuccessValidationObject) => void) {
        this.statusCode = data.statusCode!;
        this.responseBody = data.responseBody!;
        this.requestPayload = requestPayload;
        this.abstractAssertSuccess = abstractAssertSuccess;
    }

    assertSuccess = (validationObject?: AssertSuccessValidationObject): ResponseInfo => {  
        const responseBody = this.responseBody as ResponseInfo;
        this.abstractAssertSuccess(this.statusCode, responseBody, this.requestPayload, validationObject)
        return responseBody;
    }

    assertUnauthorizedError = (): ErrorResponse => {    
        expect(this.statusCode).toEqual(401);
        const responseBody = this.responseBody as ErrorResponse;
        expect(responseBody.error).toEqual("Unauthorized");
        return responseBody;
    };

    assertForbbidenError = (): ErrorResponse => {    
        expect(this.statusCode).toEqual(403);
        const responseBody = this.responseBody as ErrorResponse;
        expect(responseBody.error).toEqual("Forbidden");
        return responseBody;
    };

    assertValidationError = (): ErrorResponse => {    
        expect(this.statusCode).toEqual(400);
        const responseBody = this.responseBody as ErrorResponse;
        expect(responseBody.error).toEqual("Invalid request");
        return responseBody;
    };

    assertConflictError = (): ErrorResponse => {    
        expect(this.statusCode).toEqual(409);
        const responseBody = this.responseBody as ErrorResponse;
        expect(responseBody.error).toEqual("Could not be created");
        return responseBody;
    };
    
}