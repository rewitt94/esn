import * as express from 'express';
import { mock } from "jest-mock-extended";
import UserService from "../../src/services/UserService";
import AuthService from "../../src/services/AuthService";
import UsersController from "../../src/controllers/UsersController";

jest.mock("../../src/services/UserService");
const mockedUserService = mock<UserService>();

jest.mock("../../src/services/AuthService");
const mockedAuthService = mock<AuthService>();

describe("UsersController", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createUser", () => {

        it("response is created user", async () => {

            const usersController = new UsersController();
            // @ts-ignore
            usersController.userService = mockedUserService;

            const mockedResponse = mock<express.Response>();

            // @ts-ignore
            await usersController.createUser({ body: { username: "tester1000", password: "mypassword" }}, mockedResponse);

            expect(mockedUserService.saveUser).toHaveBeenCalled();
            expect(mockedResponse.status).toHaveBeenCalledWith(201);
            expect(mockedResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                username: "tester1000",
                hashedPassword: expect.stringMatching(/.*/),
                id: expect.stringMatching(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/),
                dateCreated: expect.stringMatching(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/)
            }));

        });

        it("validation error if createUserRequest does not contain password", async () => {

            const usersController = new UsersController();

            // @ts-ignore
            await expect(usersController.createUser({ body: { username: "abc" } }, {})).rejects.toThrowError(expect.objectContaining({
                message: "Invalid request",
                statusCode: 400
            }));

        });

        it("validation error if createUserRequest does not contain username", async () => {

            const usersController = new UsersController();

            // @ts-ignore
            await expect(usersController.createUser({ body: { password: "happ123123" } }, {})).rejects.toThrowError(expect.objectContaining({
                message: "Invalid request",
                statusCode: 400
            }));

        });

        it("validation error if createUserRequest has password < 5 length", async () => {

            const usersController = new UsersController();

            // @ts-ignore
            await expect(usersController.createUser({ body: { username: "abc", password: "happ" } }, {})).rejects.toThrowError(expect.objectContaining({
                message: "Invalid request",
                statusCode: 400
            }));

        });

        it("validation error if createUserRequest has password > 30 length", async () => {

            const usersController = new UsersController();

            // @ts-ignore
            await expect(usersController.createUser({ body: { username: "abc", password: "happ123123asdzxl;vupo2347809a6sduialhe123sdf" } }, {})).rejects.toThrowError(expect.objectContaining({
                message: "Invalid request",
                statusCode: 400
            }));

        });

    });

    describe("login", () => {

        it("response is accesstoken", async () => {

            const usersController = new UsersController();
            // @ts-ignore
            usersController.userService = mockedUserService;
            // @ts-ignore
            usersController.authService = mockedAuthService;

            const mockedResponse = mock<express.Response>();

            const ACCESS_TOKEN = "ACCESS_TOKEN";
            mockedAuthService.createAccessToken.mockReturnValueOnce(ACCESS_TOKEN);

            // @ts-ignore
            await usersController.login({ body: { username: "tester1000", password: "mypassword" } }, mockedResponse);

            expect(mockedUserService.login).toHaveBeenCalled();
            expect(mockedAuthService.createAccessToken).toHaveBeenCalled();
            expect(mockedResponse.status).toHaveBeenCalledWith(200);
            expect(mockedResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                accessToken: ACCESS_TOKEN
            }));

        });

        it("validation error if loginRequest does not contain password", async () => {

            const usersController = new UsersController();

            // @ts-ignore
            await expect(usersController.login({ body: { username: "abc" } }, {})).rejects.toThrowError(expect.objectContaining({
                message: "Invalid request",
                statusCode: 400
            }));

        });

        it("validation error if loginRequest does not contain username", async () => {

            const usersController = new UsersController();

            // @ts-ignore
            await expect(usersController.login({ body: { password: "happ123123" } }, {})).rejects.toThrowError(expect.objectContaining({
                message: "Invalid request",
                statusCode: 400
            }));

        });

    });

});

