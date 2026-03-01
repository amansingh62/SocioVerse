import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: process.env.PORT!,
    ACCESS_SECRET: process.env.ACCESS_SECRET!,
    REFRESH_SECRET: process.env.REFRESH_SECRET!,
    REDIS_URL: process.env.REDIS_URL!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
};