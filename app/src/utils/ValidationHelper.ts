import { BadRequestStatus, UnprocessableEntityStatus } from "./HTTPStatuses";
import { validateOrReject } from "class-validator";
import { HTTPError } from "./HTTPError";

export default class ValidationHelper {

    private static UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/;

    static validateRequestBody = async (requestBody: any) => {
        try {
            await validateOrReject(requestBody);
        } catch (validationError) {
            throw new HTTPError(BadRequestStatus, 'validateRequestBody - unable to validate request body', { validationError });
        }
    }

    static validateEntity = async (entity: any) => {
        try {
            await validateOrReject(entity);
        } catch (validationError) {
            throw new HTTPError(UnprocessableEntityStatus, 'validateEntity - unable to validate psql entity', { validationError });
        }
    }

    static validateUuid = (uuid: string) => {
        if (uuid === undefined || ValidationHelper.UUID_REGEX.test(uuid) === false) {
            throw new HTTPError(BadRequestStatus, 'validateUuid - uuid is invalid', { uuid });
        }
    }

}

