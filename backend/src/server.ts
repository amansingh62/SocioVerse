import http from "http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import "./lib/redis.js";
import { initSocket } from "./lib/websocket.js";

const server = http.createServer(app);
initSocket(server);

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});