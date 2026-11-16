# SynthCore

A **local-first** collaborative workspace. It holds Kanban boards and rich-text documents that several people can edit at once, and it keeps working offline.

## Roadmap (one step at a time)

| # | Step | What you learn |
|---|------|----------------|
| 0 | ✅ Project setup (Vite + React + TypeScript) | Tooling, project structure, dev server |
| 1 | A Kanban board that lives only in React state | Components, props, `useState`, TypeScript types |
| 2 | Move the board's data into a **Yjs** document | What a CRDT is and why merges never conflict |
| 3 | Save locally with **IndexedDB** (`y-indexeddb`) | Local-first and offline persistence |
| 4 | A **WebSocket sync server** in Node | Real-time sync between browsers |
| 5 | A **document editor** with Tiptap on the same engine | Reusing the sync layer for a second data type |
| 6 | **Presence**: live cursors and who's online (Yjs Awareness) | Ephemeral state vs. persisted state |
| 7 | **Postgres + Drizzle**: persist on the server, list workspaces | SQL, ORMs, migrations, Docker |
| 8 | **Auth** (Better Auth) and permissions | Sessions, securing WebSockets |
| 9 | **Time travel**: a history slider | Snapshots and CRDT state vectors |
| 10 | **Sync metrics panel**: online/offline, bytes, latency | Observability |
| 11 | Deploy | Production builds, hosting |

## Run it

```bash
cd client
npm install
npm run dev
```
