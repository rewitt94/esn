import { AccessTokenStatus } from "../enums/AccessTokenStatus"

export interface AccessTokenClaims {
    exp: number
    user: string
    username: string
    status: AccessTokenStatus
};