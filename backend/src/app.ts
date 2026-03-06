import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "../src/modules/auth/authRoutes.js";
import userRoutes from "../src/modules/user/userRoutes.js";
import followRoutes from "../src/modules/follow/followRoutes.js";
import postRoutes from "../src/modules/post/postRoutes.js";
import { env } from "./config/env.js";

export const app = express();

app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/post", postRoutes);