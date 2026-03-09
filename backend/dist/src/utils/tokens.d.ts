import type { AccessTokenPayload, RefreshTokenPayload } from "../types/jwt.js";
export declare const generateAccessToken: (userId: string) => string;
export declare const generateRefreshToken: (userId: string) => string;
export declare const verifyAccessToken: (token: string) => AccessTokenPayload;
export declare const verifyRefreshToken: (token: string) => RefreshTokenPayload;
//# sourceMappingURL=tokens.d.ts.map