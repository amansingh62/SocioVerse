import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT!,
  ACCESS_SECRET: process.env.ACCESS_SECRET!,
  REFRESH_SECRET: process.env.REFRESH_SECRET!,
  REDIS_URL: process.env.REDIS_URL!,
  FRONTEND_URL: process.env.FRONTEND_URL!,


  AWS_REGION: process.env.AWS_REGION!,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME!,

  
  CLOUDINARY_CLOUD: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,

  AI_KEY: process.env.OPENAI_API_KEY!,
  PINECONE_KEY: process.env.PINECONE_API_KEY!,
};
