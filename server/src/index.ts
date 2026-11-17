import http from "node:http";
import { WebSocketServer } from "ws";
import { setupWSConnection, setPersistence } from "@y/websocket-server/utils";
import { config } from "./config.js";
import { db, sql } from "./db/client.js";
import { createDocStore } from "./persistence/docStore.js";
import { createYjsPersistence } from "./persistence/yjsPersistence.js";

// The sync server: relays Yjs updates between devices AND saves every update
// to Postgres, so the list survives even if every device is offline or wiped.
//
//   phone ──┐                         ┌── laptop
//           └── WebSocket ── server ──┘
//                              │
//                          Postgres

const persistence = createYjsPersistence(createDocStore(db));
setPersistence(persistence);

// A plain HTTP server. We use it for a health check, and the WebSocket server
// "upgrades" connections on the same port.
const httpServer = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (socket, req) => {
  console.log(`[sync] device connected to room "${req.url}" (${wss.clients.size} online)`);
  socket.on("close", () => console.log(`[sync] device left (${wss.clients.size} online)`));

  // y-websocket's helper speaks the Yjs sync protocol for us:
  //   1. exchange "what do you have?" (state vectors)
  //   2. send each other only the missing updates
  //   3. relay every new update to everyone else in the room
  setupWSConnection(socket, req);
});

httpServer.listen(config.port, "0.0.0.0", () => {
  console.log(`[sync] listening on ws://localhost:${config.port}`);
});

// Graceful shutdown: on Ctrl+C, finish saving before exiting.
async function shutdown() {
  console.log("[sync] shutting down, flushing pending writes…");
  wss.close();
  httpServer.close();
  await persistence.flush();
  await sql.end();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
