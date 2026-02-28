import { Redis } from "ioredis";
import { env } from "../config/env.js"

export const pub = new Redis(env.REDIS_URL);
export const sub = new Redis(env.REDIS_URL);

pub.on("connect", () => {
    console.log("Redis pub connected" );
});

sub.on("connect", () => {
    console.log("Redis sub connected" );
});

pub.ping().then(console.log);

