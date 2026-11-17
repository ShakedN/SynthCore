import http from "node:http";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "@y/websocket-server/utils";

// The sync server. Its only job right now: relay Yjs updates between devices.
//
//   phone ──┐                 ┌── laptop
//           └── WebSocket ── server ── WebSocket ┘
//
// Each "room" (the path in the URL, e.g. ws://host:1234/household-demo) is one
// shared Y.Doc. The server keeps its OWN copy of each doc in memory, so a device
// that connects later still gets the full list, even if no other device is online.

const PORT = Number(process.env.PORT ?? 1234);

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

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`[sync] listening on ws://localhost:${PORT}`);
});
