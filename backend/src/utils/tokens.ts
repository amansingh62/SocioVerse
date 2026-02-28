import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AccessTokenPayload, RefreshTokenPayload } from "../types/jwt";

export const generateAccessToken = (userId: string) => 
    jwt.sign({ userId }, env.ACCESS_SECRET, { expiresIn: "15m" });

export const generateRefreshToken = (userId: string) => 
    jwt.sign({ userId }, env.REFRESH_SECRET, { expiresIn: "7d" });

export const verifyAccessToken = (token: string) => 
    jwt.verify(token, env.ACCESS_SECRET) as AccessTokenPayload;

export const verifyRefreshToken = (token: string) => 
    jwt.verify(token, env.REFRESH_SECRET) as RefreshTokenPayload;