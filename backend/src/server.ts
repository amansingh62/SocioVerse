import http from "http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { initWebSocket } from "./ws/server.js";

const server = http.createServer(app);
initWebSocket(server);

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});