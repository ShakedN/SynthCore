import * as Y from "yjs";
import { doc } from "./doc";

// TEMPORARY sync between browser tabs, so we can watch CRDT merges before we
// have a server (the server arrives in Step 4).
//
// BroadcastChannel is a built-in browser API: tabs of the same site can send
// messages to each other. Each tab plays the role of a separate "device".

type Message =
  | { type: "hello"; state: Uint8Array } // "I just came online, here's everything I have"
  | { type: "update"; update: Uint8Array }; // "here's a change"

const channel = new BroadcastChannel("synthcore-demo");
let online = true;

// 1. Whenever OUR doc changes, tell the other tabs.
doc.on("update", (update: Uint8Array, origin: unknown) => {
  if (origin === "remote") return; // don't echo back changes we just received
  if (online) channel.postMessage({ type: "update", update } satisfies Message);
  // While offline we send nothing. The change stays in our doc, and we send it
  // later with our full state in "hello".
});

// 2. Whenever another tab sends something, merge it into our doc.
channel.onmessage = (e: MessageEvent<Message>) => {
  if (!online) return; // pretend we can't hear anything while offline
  const msg = e.data;
  if (msg.type === "update") {
    Y.applyUpdate(doc, msg.update, "remote");
  } else {
    // Someone just (re)connected: take their state AND send them ours.
    Y.applyUpdate(doc, msg.state, "remote");
    channel.postMessage({ type: "update", update: Y.encodeStateAsUpdate(doc) } satisfies Message);
  }
};

function sayHello() {
  channel.postMessage({ type: "hello", state: Y.encodeStateAsUpdate(doc) } satisfies Message);
}

export function setOnline(value: boolean) {
  online = value;
  if (online) sayHello(); // reconnect = exchange full states, the CRDT merges them
}

sayHello(); // on page load, get the current list from any open tab
