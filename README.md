# SynthCore 🛒

A **local-first, shared family shopping list that understands recipes.**

Paste a link to a recipe video and an AI agent extracts the ingredients. They wait under **Pending Approval**, grouped by recipe, so you approve only what you don't already have at home. Approved items join the shared list, sorted by supermarket aisle. Everyone in the household sees changes instantly. Everything works **offline** in the supermarket and syncs with **no conflicts** once you reconnect, because the data is stored in a **CRDT** (Yjs).

## Roadmap

| Phase | What | Status |
|---|---|---|
| **0. Foundation** | React UI, Yjs CRDT, IndexedDB, monorepo, WebSocket sync server, Postgres (Docker + Drizzle), Vitest | ✅ |
| **1. Recipe Agent MVP** | Hand-written Claude tool-use loop: transcript, description, frames (vision), duplicate search (pgvector) → pending items | ⏳ next |
| **2. Evals + tracing** | Frozen fixtures, labeled dataset, precision/recall report, Langfuse traces, in-app "Why?" panel | |
| **3. Price Agent** | Israeli price-transparency files → Postgres, product matching, cheapest basket, explained | |
| **4. Orchestrator** | Explicit routing between agents, shared run state, retries | |
| **5. Households + deploy** | Better Auth, invites, per-household rooms, secured WebSockets, hosting | |

## Run it

Requires **Node 22+** and **Docker**.

```bash
npm install          # install every workspace (from the repo root)
npm run db:up        # start Postgres in Docker
npm run db:migrate   # create the tables
npm run dev          # sync server (:1234) + web app (:5173)
npm test             # run the tests (needs the database running)
```

## Project structure

```
SynthCore/
├── client/                 React web app (Vite)
│   └── src/crdt/           Y.Doc, actions, IndexedDB + WebSocket sync
├── server/                 Node sync server
│   ├── src/db/             Drizzle schema + client
│   ├── src/persistence/    Saves Yjs updates to Postgres
│   ├── drizzle/            Generated SQL migrations
│   └── test/               Vitest tests
├── packages/shared/        Types shared by client and server
└── docker-compose.yml      Postgres 17 + pgvector
```

## Architecture decisions

### Local-first: every device holds the full list
The UI reads and writes a **local** Y.Doc only, so every action takes 0ms and works with no signal (the supermarket problem). The copy is saved to IndexedDB and synced in the background over WebSocket. The server is a relay plus a backup, **not the source of truth**: if it loses its memory, the devices re-upload their state when they reconnect.

### CRDT instead of "last write wins"
Two people editing offline must never lose each other's work, and must never end up with different lists. Yjs guarantees **convergence**: every replica that has received the same updates is identical, whatever order they arrived in. Merges are idempotent and commutative, so "send everything on reconnect" is always safe.

### Data shape: one flat map of items, status as a field
Pending → List → Bought is a **field change** (`status`), not moving an item between lists. A move would be a delete plus an insert, which can duplicate items under concurrent offline edits. Each item is its own nested `Y.Map`, so concurrent edits to *different* fields of the same item are both kept. The resulting conflict rules are pinned by tests in `server/test/crdt-rules.test.ts`:
- delete vs. concurrent edit → **delete wins**
- edits to different fields → **both kept**
- items added offline on two devices → **both kept**

### Server storage: an append-only log of updates
Each Yjs update is one `INSERT` into `yjs_updates`; a document is loaded by merging its rows (`Y.mergeUpdates`).
- **Pros:** writes are cheap with no read-modify-write races, and the full history is kept, which the Time Travel feature will use.
- **Trade-off:** the number of rows grows forever. Later fix: periodic compaction into snapshots, keeping enough history for time travel.
- Updates that arrive while a document is still loading are captured (the listener is attached *before* the load), and data loaded from the DB is never written back. Both behaviors are covered by tests.

### Human-in-the-loop instead of pantry tracking
The AI never adds items straight to the list; they wait for approval. Tracking what's in the pantry would require constant manual updates that users abandon, and a stale inventory leads to wrong purchases. A one-tap approval keeps the human as the source of truth about what's at home.
