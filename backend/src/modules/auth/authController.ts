import type { Response, Request } from "express";
import { StatusCodes } from "../../constants/statusCodes.js";
import { prisma } from "../../lib/prisma.js";
import { comparePassword, hashPassword } from "../../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/tokens.js";
import { clearCookies, setAuthCookies } from "../../utils/cookies.js";

export const register = async (res: Response, req: Request) => {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if(existingUser) return res.status(StatusCodes.BAD_REQUEST).json({ message: "User already exists" });

    const hashed = await hashPassword(password);
    
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashed
        },
    });

    return res.status(StatusCodes.OK).json({ message: "User Created Successfully "});
};

export const login = async (res: Response, req: Request) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if(!user) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid Credentials" });

    const isValid = await comparePassword(password, user.password);

    if(!isValid) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid Credentials" });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    setAuthCookies(res, accessToken, refreshToken);

    res.json({ success: true });
};

export const refresh = async (res: Response, req: Request) => {
    const token = req.cookies.refreshToken;

    if(!token) return res.status(StatusCodes.UNAUTHORIZED).json({ messaage: "Unathorized" });

    let payload;

    try {
     payload = verifyRefreshToken(token);
    } catch {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid refresh token" });
    };

    const newAccessToken = generateAccessToken(payload.userId);
    const newRefreshToken = generateRefreshToken(payload.userId);

    setAuthCookies(res, newAccessToken, newRefreshToken);
    
    res.json({ success: true });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (token) {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  clearCookies(res);

  return res.json({ message: "Logged out successfully" });
};