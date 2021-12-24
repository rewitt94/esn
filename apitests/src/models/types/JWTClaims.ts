import { AccessTokenStatus } from "../enums/AccessTokenStatus";

export interface JWTClaims {
    user: string,
    username: string,
    status: AccessTokenStatus,
    iat: number,
    exp: number,
}
