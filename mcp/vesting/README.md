# Vesting MCP Server

An MCP (Model Context Protocol) server exposing City of Franklin vesting
domain data — development projects, milestones, vesting periods, approvals,
resolutions, and notifications — as read-only tools for Claude and other MCP
clients.

## Overview

This server does **not** call the `eng-api-ts` Express API and does **not**
go through Sequelize. It connects directly to the vesting SQL Server database
as a dedicated `claude` SQL login and reads from views in a dedicated
`claude` schema — a separate, independent path into the same physical
database that `eng-api-ts` itself uses via Sequelize. `eng-api-ts` and its
Entra-based auth are untouched by this server; the `claude` login's grants
are the entire auth boundary here. This mirrors `mcp/stormwater/` exactly —
see that module's README for the pattern this was built from.

It lives in this repo (`mcp/vesting/`) rather than a separate repo so it's
versioned alongside the API it reads from, but it's a fully independent Node
process — its own `package.json`, dependency tree, and port.

## Requirements

- Node.js
- The `claude` schema's views must already exist on the vesting database, and
  the `claude` SQL login must have `SELECT` granted on that schema — this
  server has no write access by design.

## Database setup

The `claude` schema's views (`project`, `milestone`, `milestone_status`,
`extension`, `vesting_period`, `vesting_status`, `vesting_extension`,
`notification`, `approval`, `resolution`) mirror the `dbo` tables 1:1 — same
columns as the Sequelize models in `src/models/vesting/`. In particular:

- `milestone.parentId`, `vesting_period.parentId`, `notification.parentId`,
  `approval.parentId`, and `resolution.parentId` all store the **project's**
  `uuid` directly (see each model's `belongsTo(Project, { targetKey: 'uuid',
  foreignKey: 'parentId' })`) — there's no internal numeric id to join
  through.
- `extension.parentId` and `milestone_status.parentId` store the
  **milestone's** `uuid`; `vesting_extension.parentId` and
  `vesting_status.parentId` store the **vesting period's** `uuid`, one level
  down from the project.

Because the views are plain mirrors, there's no precomputed "effective date"
(extension-overrides-base-date) or joined-in `projectType` column — the
tools compute both themselves via SQL joins/CTEs at query time (see
`tools/vesting/listMilestonesDue.ts` and `listVestingPeriods.ts`).

Grant read access:

```sql
GRANT SELECT ON SCHEMA::claude TO claude
```

**Schema ownership matters, not just the grant above.** If the `claude`
schema is owned by the `claude` login itself (e.g. it was created via
`CREATE SCHEMA claude AUTHORIZATION claude`) rather than by `dbo`, SQL
Server's ownership-chaining optimization breaks: querying `claude.project`
falls through to checking permission on the underlying `dbo.project` table
directly (visible in the error text — it'll name schema `dbo`, not
`claude`), and the grant above alone won't be enough. Fix by re-owning the
schema to match the base tables' owner:

```sql
ALTER AUTHORIZATION ON SCHEMA::claude TO dbo
```

Verify by logging in to SSMS **as the `claude` login** and confirming
`SELECT TOP 5 * FROM project` (relying on its default schema) returns rows,
while `SELECT * FROM dbo.project` fails.

## Setup

```bash
npm install
cp .env.example .env
# edit .env with real VESTING_DB_* / ENTRA_* / ANTHROPIC_API_KEY values
```

## Development

```bash
npm run dev     # run with tsx + nodemon, auto-reload
npm run build   # compile TypeScript to dist/ (tsc + tsc-alias)
npm start       # run compiled server from dist/
npm run deploy  # rsync build + .env to production host and restart via pm2
```

The server listens on `MCP_PORT` (default `7004` — distinct from
stormwater's `7003`) and exposes:

- `GET /vesting/health` — health check, no key required
- `POST /vesting` — MCP streamable HTTP endpoint, for MCP clients (Claude Desktop/Code, etc.) — requires the `X-MCP-Key` shared-secret header (see below)
- `POST /vesting/chat` — Entra-gated REST chat endpoint for a browser AI chat panel (see below)
- `DELETE /vesting/chat/:sessionId` — resets a chat session's history

## Chat endpoint

`POST /vesting/chat` runs a bounded Claude tool-use loop server-side against
the same tools listed below, and returns one finished reply — no
streaming/SSE. It requires the same Entra bearer token `eng-api-ts` itself
validates (same `ENTRA_CLIENT_ID`/`ENTRA_TENANT_ID`, no separate app
registration), enforced by `middleware/entra.ts`, which mirrors
`eng-api-ts`'s own `@middleware/auth/entra` — including its
`NODE_ENV=development` mock-user bypass (set via `npm run dev`, never via
`.env`, since `.env` is what `npm run deploy` ships to prod as-is).

Request:
```json
{ "sessionId": "<uuid, omit on first turn>", "message": "..." }
```
Response:
```json
{ "sessionId": "<uuid>", "reply": "..." }
```

Conversation history is held in-memory per `sessionId`
(`utils/chatSessions.ts`), lost on restart/redeploy — callers only ever send
the latest `message`, never full history. It's trimmed to the last ~20
messages **and** a ~60,000-character total size budget, whichever is hit
first, dropping whole user+assistant turns (never leaving a `tool_result`
orphaned from its `tool_use`); any single oversized `tool_result` is also
truncated on its own. The size budget exists because CivicClerk tool results
(meeting listings, agenda item matches) run far larger than the original
SQL-backed vesting tools' results — a message-count cap alone let a handful
of turns with a few large tool calls accumulate enough tokens to exceed the
model's context window, which surfaced as an opaque 500 from `/vesting/chat`
(logged server-side via `describeError`, but not surfaced to the caller).

The MCP frontend calling this (e.g. `project-vesting-vite-ts`'s side-panel
chat) needs its own `VITE_MCP_URL`/`/vesting/chat` wiring, matching
`stormwater-vite-ts`'s `AiChatPanel` pattern.

## Project Structure

```
app.ts                Server entrypoint (loads env once, wires up Express + MCP + chat)
middleware/entra.ts    Entra ID (Azure AD) JWT verification, mirrors eng-api-ts's own
middleware/mcpKey.ts   X-MCP-Key shared-secret gate for the raw MCP endpoint
routes/mcp.ts          MCP streamable-HTTP endpoint + health check
routes/chat.ts         Entra-gated REST chat endpoint
tools/
  mssql/connection.ts  Tedious connection cache + parameterized executeQuery(), keyed by ServerKey
  vesting/             One file per vesting-domain tool (see below)
  civicclerk/          CivicClerk (public meetings) client + tools -- see "CivicClerk integration" below
utils/
  registerTools.ts     Registers all tools with the MCP server
  anthropicTools.ts    Converts the same tool defs to Anthropic native tool-use format + callTool() dispatcher
  agentLoop.ts          In-process Claude tool-use loop for the chat endpoint (bounded iterations)
  chatSessions.ts        In-memory per-sessionId conversation history store
  errors.ts             describeError() — unwraps tedious AggregateError into a readable message
  filters.ts            parseLocalDate/formatLocalDate TZ-safe date helpers
  pagination.ts         Shared { data, pagination } response envelope
  logger.ts             pino logger, mirrors eng-api-ts's own src/utils/logger.ts
.env                   Environment configuration (not committed; see .env.example)
```

## Tools

All read-only.

| Tool | Backed by | Notable params |
|---|---|---|
| `vesting_list_projects` | `claude.project` | `limit`/`offset`, `type`, `search` (name/cof/ordinance), `expired` |
| `vesting_get_project` | `claude.project` + related views, by `uuid` | Full nested detail: milestones, vesting periods, approvals, resolution, notifications |
| `vesting_list_milestones_due` | `claude.milestone` | `limit`/`offset`, `projectUuid`, `dateFrom`/`dateTo` (against `effectiveDate`), `achieved`, `expired`, `extended` (has a recorded extension), `projectType` |
| `vesting_list_vesting_periods` | `claude.vesting_period` | `limit`/`offset`, `projectUuid`, `type` (`10Y`/`15Y`), `dateFrom`/`dateTo` (against `effectiveDate`), `achieved`, `expired`, `extended` (has a recorded extension), `projectType` |
| `vesting_list_notifications` | `claude.notification` | `limit`/`offset`, `projectUuid`, `type`, `dateFrom`/`dateTo` |
| `vesting_search_project_meetings` | CivicClerk (see below), scoped to FMPC/BOMA by default | `projectUuid`, `query` (override), `startDate`/`endDate` (default: last 3 years), `committees` (override), `limit`/`offset` |
| `civicclerk_search_agenda_items` | CivicClerk `/public-api/Meetings` | `query`, `startDate`/`endDate`, `nameFilter`, `limit`/`offset` |
| `civicclerk_get_meetings` | CivicClerk `/public-api/Meetings` | `startDate`/`endDate`, `id`, `includeItems` (requires `id`), `includeAttachments`, `nameFilter`, `limit`/`offset` |
| `civicclerk_get_latest_meeting` | CivicClerk `/public-api/Meetings`, backward-expanding window search | `nameFilter` |
| `civicclerk_get_meeting_items` | CivicClerk `/public-api/Meetings` (flattened) | `startDate`/`endDate`, `id`, `limit`/`offset` |
| `civicclerk_download_attachment` | CivicClerk `/public-api/Attachments/Download` | `id` |

Tools are aggregated in `tools/index.ts` and registered on the `McpServer` in
`app.ts` via `registerAllTools`.

Both app servers (this Node process and the SQL Server host) run in
`America/Chicago`, which makes plain `Date`/string conversions easy to get
backwards by a day in either direction — see `utils/filters.ts`'s
`parseLocalDate()`/`formatLocalDate()` (copied from `mcp/stormwater`). Any new
code touching dates should go through one of these rather than `new
Date(str)` or `.toISOString()` directly.

There is no fiscal-year concept in the vesting data model (unlike
stormwater's July–June fiscal year), so no `fiscalYear` param exists on any
tool here.

## CivicClerk integration

`tools/civicclerk/` lets these tools search where vesting projects show up on
public meeting agendas (Planning Commission, BOMA, etc.) via Franklin TN's
CivicClerk instance. It was ported from `finance-mcp-server-ts`
(`/home/andrew/apps/mcp/finance-mcp-server-ts`), a separate, standalone MCP
server that already solved the same problem for its own domain — see that
repo's `tools/civicclerk/` for the source this was ported from, and this
repo's `.claude` public-meetings skill for the query patterns/gotchas that
motivated its design.

- **No auth**: CivicClerk's public API (`CIVICCLERK_BASE_URL`, defaults to
  `https://franklintn.v8.civicclerk.com`) takes no key or token.
- **Why the chunking/caching exists**: the vendor API only accepts date-range
  filters — no pagination, no field selection — and returns full agenda-item
  trees (multi-MB for a busy date range) on every call. `dateChunking.ts`
  splits any range into ≤90-day windows fetched with bounded concurrency and
  merges them; `cache.ts` is a TTL+byte-capped LRU cache (~1hr) so repeat
  queries against the same range are instant instead of re-hitting the
  vendor. Every list/search tool still caps and paginates its own output on
  top of that (see the tools table above).
- **`vesting_search_project_meetings` scopes to FMPC/BOMA by default**:
  vesting projects (Development Plan / Preliminary Plat / Site Plan) are
  heard by the Franklin Municipal Planning Commission (FMPC) before going to
  the Board of Mayor and Aldermen (BOMA) for final approval — per department
  feedback. Restricting the default committee match to those two (rather
  than scanning every committee CivicClerk tracks) keeps the post-fetch scan
  and the response payload smaller, which matters given the vendor API's
  lack of server-side filtering. The keyword list lives in
  `tools/vesting/searchProjectMeetings.ts` as
  `DEFAULT_DEVELOPMENT_COMMITTEE_KEYWORDS` and has been verified against live
  2025 CivicClerk data — see the code comment there for why all four
  keywords (`FMPC`, `Planning Commission`, `BOMA`, `Board of Mayor`) are
  needed and none are redundant (each committee's own main recurring meeting
  is spelled out in full, without its own abbreviation, so dropping either
  abbreviation would silently miss that committee's most common meeting).
  Callers can override the list per-call via the `committees` param if
  department feedback ever expands this to other committees (Design Review,
  Board of Zoning Appeals, Historic Zoning Commission, and Capital
  Investment Committee also occasionally touch development topics, per the
  same data pull, but aren't in the default list).
- **Generic tools stay available, scoped down to what this server needs**:
  `civicclerk_search_agenda_items`, `civicclerk_get_meetings`,
  `civicclerk_get_meeting_items`, and `civicclerk_download_attachment` cover
  topic search, meeting/agenda browsing by committee and date (e.g. "what's
  on next week's BOMA agenda" — not tied to a specific project), and
  attachment download, for any broader/non-project-specific meeting
  question. `civicclerk_get_events` from `finance-mcp-server-ts` was
  deliberately left out here — nothing in this server's use cases needs the
  events endpoint specifically once `civicclerk_get_meetings` covers
  scheduling/listing; it's still available in `finance-mcp-server-ts` if
  ever needed.
- **`civicclerk_get_latest_meeting` exists because "most recent" has no
  native answer**: CivicClerk's API only accepts date-range queries — there
  is no "give me the latest N" endpoint. Answering "when was the most recent
  FMPC meeting?" by having the caller (or the chat agent) guess a date range
  either misses it (guessed range too narrow) or risks the same slow/hangy
  multi-chunk fetch a wide guessed range causes elsewhere in this
  integration. This tool instead searches backward in small windows (30,
  90, 180, 365, 730, 1825 days) via the same `fetchAllMeetings` used
  everywhere else, and stops at the first window with a match — so a
  regularly-meeting committee resolves in one fast call instead of a
  multi-year scan. See `tools/civicclerk/getLatestMeeting.ts`.
- **No shared package**: each MCP server here (`mcp/vesting`,
  `mcp/stormwater`, and `finance-mcp-server-ts` in its own repo) is deployed
  standalone via its own `package.json`/pm2 process, so this client +
  chunking + cache code is duplicated rather than factored into a shared
  library — consistent with how `finance-mcp-server-ts` itself is deployed,
  and cheaper than introducing a cross-repo package boundary for ~150 lines
  of stable code.

## Security

- The `claude` SQL login should only ever have `SELECT` granted on the
  `claude` schema — never on base tables, never `INSERT`/`UPDATE`/`DELETE`,
  never `db_datareader`. That grant is what makes this read-only; there is no
  application-level write guard to fall back on.
- Every query is parameterized via `tedious`'s `addParameter` — filter values
  from tool callers are never string-interpolated into SQL.
- List tools cap page size (`limit`, max 100–200 depending on the tool) and
  always return pagination metadata so callers know if more data exists.
- `/vesting/chat` (and its `DELETE`) are Entra-gated. The raw MCP endpoint
  (`POST`/`GET`/`DELETE /vesting`) can't use that same flow — MCP clients
  have no OAuth/MSAL exchange to acquire a bearer token — so it's gated
  instead by a static shared secret, `MCP_API_KEY`, checked by
  `middleware/mcpKey.ts` against an `X-MCP-Key` header on every request.
  Configure it once in each MCP client's config (e.g. a `headers` block in
  Claude Desktop's/Code's `mcpServers` entry). `GET /vesting/health` does not
  require the key. Mirrors `mcp/stormwater/middleware/mcpKey.ts` exactly —
  see that module's README for why a Referer/Origin check was considered and
  rejected instead.
- Don't assume opening this server up publicly for the chat panel also locks
  down the MCP endpoint's network exposure; `MCP_API_KEY` stops callers
  without the secret, but where `/vesting` is reachable from at all is still
  a separate deployment decision.

## Error Handling

Every tool wraps its logic in try/catch and returns errors as normal MCP text
content (via `describeError`) rather than throwing, so Claude sees a readable
error message instead of a broken tool call.
