# SynthCore 🛒

A **local-first, shared family shopping list that understands recipes.**

Paste a link to a recipe video and AI extracts the ingredients. They wait under **Pending Approval**, grouped by recipe, so you approve only what you don't already have at home. Approved items join the shared list, sorted by supermarket aisle. Everyone in the household sees changes instantly. Everything works **offline** in the supermarket and syncs with **no conflicts** once you reconnect, because the data is stored in a **CRDT** (Yjs).

## Roadmap (one step at a time)

| # | Step | What you learn |
|---|------|----------------|
| 0 | ✅ Project setup (Vite + React + TypeScript) | Tooling, project structure |
| 1 | ✅ The list UI in React state: Pending → List → Bought | Components, props, `useState`, types |
| 2 | ✅ Move the data into a **Yjs** document (CRDT) | What a CRDT is and why merges never conflict |
| 3 | ✅ Save locally with **IndexedDB** (`y-indexeddb`) | Local-first and offline persistence |
| 4 | A **WebSocket sync server** in Node | Real-time sync between devices |
| 5 | **Presence**: "Dana is shopping now 🛒" | Ephemeral vs. persisted state |
| 6 | **AI recipe extraction** (YouTube transcripts or pasted text → Claude API → JSON) | Calling LLMs, structured output, server APIs |
| 7 | **Smart merging**: duplicates and quantities | Data modeling and edge cases |
| 8 | **Postgres + Drizzle**: store lists on the server | SQL, ORMs, migrations, Docker |
| 9 | **Auth + households** (Better Auth, invites) | Sessions, permissions, securing WebSockets |
| 10 | **History** (time travel) and a **sync status** panel | Snapshots, observability |
| 11 | Deploy | Production builds, hosting |

## Run it

```bash
cd client
npm install
npm run dev
```
