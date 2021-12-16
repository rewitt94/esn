// import typeorm from "typeorm";
// import User from "../../src/entities/User";
// import UserService from "../../src/services/UserService";
// import { mock } from "jest-mock-extended";
// import { USER } from "../data/data";

// // jest.mock("typeorm");

// // const mockedCompareSync = jest.fn();
// // jest.mock("bcrypt", () => ({
// //     compareSync: jest.fn()
// // }));

// const mockedUserRepository = mock<typeorm.Repository<User>>();

// describe("UserService", () => {

//     describe("createUser", () => {

//         it("user is saved to user repository", async () => {

//             const userService = UserService.getInstance();

//             // @ts-ignore
//             userService.userRepository = mockedUserRepository;

//             mockedUserRepository.findOne.mockResolvedValueOnce(undefined);

//             await expect(userService.insertUser(USER)).resolves.toEqual(USER);

//             expect(mockedUserRepository.findOne).toHaveBeenCalledWith({ username: USER.username });
//             expect(mockedUserRepository.save).toHaveBeenCalledWith(USER);

//         });

//         it("throws conflict error if user already exists", async () => {

//             const userService = UserService.getInstance();

//             // @ts-ignore
//             userService.userRepository = mockedUserRepository;

//             mockedUserRepository.findOne.mockResolvedValueOnce(USER);

//             await expect(userService.insertUser(USER)).rejects.toThrowError(expect.objectContaining({
//                 message: "could not be created",
//                 statusCode: 409
//             }));

//         });

//     });

//     // describe("login", () => {

//     //     it("Calls compare sync", async () => {

//     //         const userService = UserService.getInstance();
//     //         const loginRequest = { username: USER.username, password: "helloworld" };

//     //         // @ts-ignore
//     //         userService.userRepository = mockedUserRepository;

//     //         mockedUserRepository.findOne.mockResolvedValueOnce(USER);

//     //         await expect(userService.login(loginRequest)).resolves.toEqual(USER);

//     //         expect(mockedUserRepository.findOne).toHaveBeenCalledWith(USER);

//     //     });

//     // });

// });
