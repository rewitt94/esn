export interface HTTPStatus {
    statusCode: number,
    publicErrorMessage: string
}

export const BadRequestStatus: HTTPStatus = {
    statusCode: 400,
    publicErrorMessage: "Invalid request"
}

export const UnauthorisedStatus: HTTPStatus = {
    statusCode: 401,
    publicErrorMessage: "Unauthorised"
}

export const ForbiddenStatus: HTTPStatus = {
    statusCode: 403,
    publicErrorMessage: "Forbidden"
}

export const NotFoundStatus: HTTPStatus = {
    statusCode: 404,
    publicErrorMessage: "Resource not found"
}

export const ConflictStatus: HTTPStatus = {
    statusCode: 409,
    publicErrorMessage: "Could not be created"
}

export const UnprocessableEntityStatus: HTTPStatus = {
    statusCode: 422,
    publicErrorMessage: "Invalid entity"
}

export const ServerErrorStatus: HTTPStatus = {
    statusCode: 500,
    publicErrorMessage: "Unexpected error"
}