import http from "http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import "./lib/redis.js";
const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});