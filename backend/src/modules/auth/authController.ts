import type { Response, Request } from "express";
import { StatusCodes } from "../../constants/statusCodes.js";
import { prisma } from "../../lib/prisma.js";
import { comparePassword, hashPassword } from "../../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/tokens.js";
import { clearCookies, setAuthCookies } from "../../utils/cookies.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, username, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        email
      }
    });

    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "Email or username already taken"
      });
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashed
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true
      }
    });

    return res.status(StatusCodes.CREATED).json({
      message: "User created successfully",
      user
    });

  } catch (error) {
    console.error(error);

    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Invalid request data"
    });
  }
};

export const checkUsername = async (req: Request, res: Response) => {
  try {
    const username = req.query.username as string;

    if (!username) {
      return res.status(400).json({ available: false });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    return res.json({ available: !user });

  } catch (error) {
    console.error("checkUsername error:", error);
    return res.status(500).json({ available: false });
  }
};

export const login = async (req: Request, res: Response) => {
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

export const refresh = async (req: Request, res: Response) => {
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

export const getMe = async (req: Request, res: Response) => {

    if(!req.userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unathorizedd" });

    const user = await prisma.user.findUnique({ 
        where: { id: req.userId },
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
            createdAt: true
        },
    });

    if(!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    return res.status(StatusCodes.OK).json(user);
};