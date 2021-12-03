// import AuthService from "../../src/services/AuthService";
// import EnvVars from "../../src/utils/EnvVars";
// import jwt from "jsonwebtoken";
// import { USER } from "../data/data";

// describe("AuthService", () => {

//     describe("createInitialAccessToken", () => {

//         it("returns access token", () => {

//             const authService = AuthService.getInstance();

//             const accessToken = authService.createInitialAccessToken(USER);

//             const decoded = jwt.decode(accessToken);

//             // @ts-ignore
//             expect(decoded.user).toEqual(USER.id);
//             // @ts-ignore
//             expect(decoded.iat).toBeLessThan(new Date().getTime() / 1000);
//             // @ts-ignore
//             expect(decoded.exp).toBeGreaterThan(new Date().getTime() / 1000);
//             // @ts-ignore
//             expect(decoded.exp).toBeLessThanOrEqual(Math.ceil(new Date().getTime() / 1000 + 24 * 60 * 60));

//             jwt.verify(accessToken, EnvVars.get().valueOf("JWT_SECRET"));

//             process.env.JWT_SECRET = "different_secret"

//             expect(() => jwt.verify(accessToken, EnvVars.get().valueOf("JWT_SECRET"))).toThrowError(expect.objectContaining({
//                 name: "JsonWebTokenError",
//                 message: "invalid signature"
//             }));


//         });

//     });

// });
