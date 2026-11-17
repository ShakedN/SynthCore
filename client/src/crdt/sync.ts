import { WebsocketProvider } from "y-websocket";
import { doc } from "./doc";

// Connect our Y.Doc to the sync server over a WebSocket.
// This replaces the temporary tab-only sync from Step 2. Now any device that
// can reach the server (another browser, your phone) shares the same list.
//
// We use the page's own hostname, so if you open the app from your phone at
// http://192.168.1.20:5173, it connects to ws://192.168.1.20:1234 automatically.
const SERVER_URL = import.meta.env.VITE_SYNC_URL ?? `ws://${location.hostname}:1234`;

// "household-demo" is the room name, meaning which shared list to join.
// In Phase 5 each household gets its own room (and a login to enter it).
export const provider = new WebsocketProvider(SERVER_URL, "household-demo", doc);

export type SyncStatus = "connected" | "connecting" | "disconnected";

// Simulate losing signal (for testing offline behavior).
export function setOnline(online: boolean) {
  if (online) provider.connect();
  else provider.disconnect();
}
