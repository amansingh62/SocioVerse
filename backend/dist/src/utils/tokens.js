import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export const generateAccessToken = (userId) => jwt.sign({ userId }, env.ACCESS_SECRET, { expiresIn: "15m" });
export const generateRefreshToken = (userId) => jwt.sign({ userId }, env.REFRESH_SECRET, { expiresIn: "7d" });
export const verifyAccessToken = (token) => jwt.verify(token, env.ACCESS_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, env.REFRESH_SECRET);
//# sourceMappingURL=tokens.js.map