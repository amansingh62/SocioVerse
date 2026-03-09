import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";
import crypto from "crypto";
const s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});
export const generateUploadURL = async (fileType) => {
    const key = `profiles/${crypto.randomUUID()}.${fileType.split("/")[1]}`;
    const command = new PutObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    return {
        url,
        key,
    };
};
//# sourceMappingURL=s3.js.map