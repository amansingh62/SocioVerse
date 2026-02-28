import type { JwtPayload } from "jsonwebtoken";

export interface AccessTokenPayload {
    userId: string
};

export interface RefreshTokenPayload {
    userId: string
};
