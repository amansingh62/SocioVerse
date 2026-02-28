import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: process.env.PORT || 5000,
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    REDIS_URL: process.env.REDIS_URL!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
};