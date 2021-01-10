import ValidationHelper from "../../src/utils/ValidationHelper";
import { BadRequestStatus, UnprocessableEntityStatus } from "../../src/utils/HTTPStatuses";

jest.mock('class-validator', () => ({
    validateOrReject: () => { throw new Error("ERROR") }
}));

describe('ValidationHelper', () => {

    describe('validateRequestBody', () => {

        it('throws bad request error for invalid request body', async () => {

            await expect(async () => ValidationHelper.validateRequestBody({})).rejects.toThrowError(expect.objectContaining({
                message: BadRequestStatus.publicErrorMessage,
                statusCode: BadRequestStatus.statusCode
            }));

        });

    });

    describe('validateEntity', () => {

        it('throws unprocessable entity error for invalid entity', async () => {

            await expect(async () => ValidationHelper.validateEntity({})).rejects.toThrowError(expect.objectContaining({
                message: UnprocessableEntityStatus.publicErrorMessage,
                statusCode: UnprocessableEntityStatus.statusCode
            }));

        });

    });

});