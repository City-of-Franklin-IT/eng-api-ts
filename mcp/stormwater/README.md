# Stormwater MCP Server

An MCP (Model Context Protocol) server exposing City of Franklin stormwater
domain data — construction sites, violations, complaints, illicit discharges,
inspectors, and their status rollups — as read-only tools for Claude and other
MCP clients.

## Overview

This server does **not** call the `eng-api-ts` Express API. It connects
directly to the stormwater SQL Server database as a dedicated `claude` SQL
login and reads from views in a dedicated `claude` schema — a separate,
independent path into the same physical database that `eng-api-ts` itself
uses via Sequelize. `eng-api-ts` and its Entra-based auth are untouched by
this server; the `claude` login's grants are the entire auth boundary here.

It lives in this repo (`mcp/stormwater/`) rather than a separate repo so it's
versioned alongside the API it reads from, but it's a fully independent Node
process — its own `package.json`, dependency tree, port, and (eventually) pm2
entry — following the same shape as the other MCP servers on this
infrastructure (`~/apps/mcp/isdev-mcp-server-ts`, `finance-mcp-server-ts`,
`publicsafety-mcp-server-ts`) and `/opt/claude-standards/mcp/MCP_SETUP_GUIDE.md`.

## Requirements

- Node.js
- The `claude` schema's views must already exist on the stormwater database,
  and the `claude` SQL login must have `SELECT` granted on that schema (see
  "Database setup" below) — this server has no write access by design.

## Database setup

Run the `CREATE VIEW` statements for the `claude` schema (sites, violations,
complaints, illicit_discharges, inspectors, active_sites, logs, contacts,
site_contacts, follow_up_dates) against the stormwater database before
starting this server — see the project plan/history for the exact DDL. Then
grant read access:

```sql
GRANT SELECT ON SCHEMA::claude TO claude
```

Verify by logging in to SSMS **as the `claude` login** and confirming
`SELECT TOP 5 * FROM sites` (relying on its default schema) returns rows,
while `SELECT * FROM dbo.sites` fails — that failure is what confirms the
`claude` login has no base-table access, only the views.

## Setup

```bash
npm install
cp .env.example .env
# edit .env with real STORMWATER_DB_* values (DB_USER=claude)
```

## Development

```bash
npm run dev     # run with tsx + nodemon, auto-reload
npm run build   # compile TypeScript to dist/ (tsc + tsc-alias)
npm start       # run compiled server from dist/
npm run deploy  # rsync build + .env to production host and restart via pm2
```

`npm run deploy`'s `pm2 restart` only works once the process already exists in
pm2's runtime list. A brand-new server (or one added to
`/opt/builds/ecosystem.config.js` but never started) needs, once, on the
host: `npm install --omit=dev` in its deployed directory, then
`pm2 start /opt/builds/ecosystem.config.js --only <name>` followed by
`pm2 save`. Already done for `stormwater-mcp-ts`.

The server listens on `MCP_PORT` (default `7003`) and exposes:

- `GET /stormwater/health` — health check
- `POST /stormwater` — MCP streamable HTTP endpoint, for MCP clients (Claude Desktop/Code, etc.) — unauthenticated; the `claude` SQL login's read-only grant is its entire security boundary
- `POST /stormwater/chat` — Entra-gated REST chat endpoint for the browser AI chat panel (see below)
- `DELETE /stormwater/chat/:sessionId` — resets a chat session's history

## Chat endpoint

`POST /stormwater/chat` runs a bounded Claude tool-use loop server-side against
the same tools listed below, and returns one finished reply — no
streaming/SSE. It requires the same Entra bearer token `eng-api-ts` itself
validates (same `ENTRA_CLIENT_ID`/`ENTRA_TENANT_ID`, no separate app
registration), enforced by `middleware/entra.ts`, which mirrors
`eng-api-ts`'s own `@middleware/auth/entra` — including its `NODE_ENV=development`
mock-user bypass (set via `npm run dev`, never via `.env`, since `.env` is
what `npm run deploy` ships to prod as-is).

Request:
```json
{ "sessionId": "<uuid, omit on first turn>", "message": "..." }
```
Response:
```json
{ "sessionId": "<uuid>", "reply": "..." }
```

Conversation history is held in-memory per `sessionId` (`utils/chatSessions.ts`),
trimmed to the last ~20 messages, and lost on restart/redeploy — callers only
ever send the latest `message`, never full history. CORS
(`app.ts`) allows the same origins as `eng-api-ts`'s own whitelist:
`dev.franklintn.gov`, `apps.franklintn.gov`, `cofasv38.franklin-gov.com`,
`istest.franklintn.gov`.

## Project Structure

```
app.ts               Server entrypoint (loads env once, wires up Express + MCP)
routes/mcp.ts         MCP streamable-HTTP endpoint + health check
tools/
  mssql/connection.ts Tedious connection cache + parameterized executeQuery(), keyed by ServerKey
  stormwater/         One file per tool (see below)
utils/
  registerTools.ts    Registers all tools with the MCP server
  errors.ts           describeError() — unwraps tedious AggregateError into a readable message
  filters.ts          Shared siteId/inspectorSlug/closed/date-range filter builder (plus fiscalYear resolution) for the violation/complaint/illicit-discharge/incident/trend tools
  pagination.ts       Shared { data, pagination } response envelope
.env                  Environment configuration (not committed; see .env.example)
```

## Tools

All read-only.

| Tool | Backed by | Notable params |
|---|---|---|
| `stormwater_list_sites` | `claude.sites` | `limit`/`offset`, `inspectorSlug`, `hasOpenViolation`/`hasOpenComplaint`/`hasOpenIllicitDischarge`, `activeOnly` |
| `stormwater_get_site` | `claude.sites` + related views, by `uuid` | `uuid` — full nested detail (violations, complaints, illicit discharges, logs, site contacts, follow-up dates) |
| `stormwater_list_violations` | `claude.violations` | `limit`/`offset`, `siteId`, `inspectorSlug`, `closed`, `dateFrom`/`dateTo` |
| `stormwater_list_complaints` | `claude.complaints` | `limit`/`offset`, `siteId`, `inspectorSlug`, `closed`, `dateFrom`/`dateTo` |
| `stormwater_list_inspections` | `claude.logs` | `limit`/`offset`, `siteId`, `inspectorSlug` (joins to `sites`, since `logs` has no inspector column of its own), `dateFrom`/`dateTo`; response includes `distinctSiteCount` |
| `stormwater_list_illicit_discharges` | `claude.illicit_discharges` | `limit`/`offset`, `siteId`, `inspectorSlug`, `closed`, `dateFrom`/`dateTo` |
| `stormwater_list_inspectors` | `claude.inspectors` | `limit`/`offset`, `activeOnly` |
| `stormwater_get_inspector_workload` | `claude.inspectors` + `claude.sites`, by `slug` | `limit`/`offset` — per-site *current open-status* rollup (slim field set) for everything assigned to an inspector |
| `stormwater_get_inspector_activity` | `claude.inspectors` + `claude.logs`/`sites`/`violations`/`complaints`/`illicit_discharges`, by `slug` | `dateFrom`/`dateTo` — *historical* rollup: inspections + distinct sites visited, plus violations/complaints/illicit-discharge counts, in one call |
| `stormwater_list_active_sites` | `claude.active_sites` | `limit`/`offset` — slim, map-friendly field set |
| `stormwater_summarize_incidents` | `claude.violations` + `claude.complaints` + `claude.illicit_discharges` | `siteId`, `inspectorSlug`, `dateFrom`/`dateTo` — counts only, one call instead of three |
| `stormwater_summarize_trends` | same three + `claude.logs` | `fiscalYear` or `dateFrom`+`dateTo` (one is required), `siteId`, `inspectorSlug` — monthly counts of all four, one row per calendar month even if 0 |
| `stormwater_list_follow_up_dates` | `claude.follow_up_dates` + `claude.violations`/`complaints`/`illicit_discharges` | `limit`/`offset`, `siteId`, `inspectorSlug`, `dateFrom`/`dateTo`, `overdue`, `closed` — resolves each follow-up's site/inspector/open-status via its parent record |
| `stormwater_list_enforcement_deadlines` | `claude.follow_up_dates` + `claude.violations`/`illicit_discharges` (`penaltyDueDate`/`swoDate`), merged via `UNION ALL` | `limit`/`offset`, `type` (`follow_up`/`payment_due`/`stop_work_order`), `siteId`, `inspectorSlug`, `dateFrom`/`dateTo`, `overdue`, `resolved` — one chronological feed instead of piecing together follow-ups and the penalty/SWO columns yourself |
| `stormwater_list_contacts` | `claude.contacts` | `limit`/`offset`, `search` (name or company substring), `activeOnly` — resolve a name to a `contactId` before the two tools below |
| `stormwater_get_contact_sites` | `claude.site_contacts` + `claude.sites`, by `contactId` | `limit`/`offset` — every site the contact is linked to (primary/contractor/inspector role flags) plus each site's open-status flags |
| `stormwater_get_contact_activity` | `claude.contacts` + `claude.violations`/`complaints`/`illicit_discharges`, by `contactId` | `dateFrom`/`dateTo` — violation/complaint/illicit-discharge counts across every site that contact is linked to |

Tools are aggregated in `tools/index.ts` and registered on the `McpServer` in
`app.ts` via `registerAllTools`.

`inspectorSlug` on `violations`/`complaints`/`illicit_discharges` (and the
tools built on them) filters via a subquery against `inspectors.slug`, since
those views already denormalize `inspectorId` directly. `logs` (inspections)
has no inspector column at all — its `inspectorSlug` filter, and
`stormwater_get_inspector_activity`'s inspection count, join to
`sites.inspectorSlug` instead. That's a deliberate stand-in for "inspector
performed this inspection": a site keeps the same assigned inspector for its
whole lifespan, so joining through the site's current assignment is accurate
here, not just a convenient approximation.

Both app servers (this Node process and the SQL Server host) run in
`America/Chicago`, which makes plain `Date`/string conversions easy to get
backwards by a day in either direction: `new Date("YYYY-MM-DD")` parses as
UTC midnight, then reading it back with local getters can land on the
previous day; conversely, `date.toISOString()` always converts to UTC first,
so reading "today" that way can report tomorrow's date for several hours
every evening (CDT is UTC-5, so anything after ~7pm local is already past
midnight UTC). `utils/filters.ts` has one fix for each direction —
`parseLocalDate()` for turning a `dateFrom`/`dateTo` string into a `Date` to
send to tedious, and `formatLocalDate()` for turning a `Date` (e.g. "now")
back into the server's actual local `YYYY-MM-DD`, used for the chat agent's
"today's date" context. Any new code touching dates should go through one of
these rather than `new Date(str)` or `.toISOString()` directly.

Every tool that takes `dateFrom`/`dateTo` also accepts a `fiscalYear` string
(e.g. `"2025"`) as a shortcut, resolved by `utils/filters.ts`'s
`resolveDateRange()`. City of Franklin's fiscal year runs July 1 – June 30,
named for the calendar year it ends in, so `fiscalYear: "2025"` means
`2024-07-01`–`2025-06-30`. If both are given, `fiscalYear` wins outright
(`dateFrom`/`dateTo` are ignored, not intersected). A malformed `fiscalYear`
(anything without a 4-digit year) returns a normal tool error rather than
throwing past the caller.

## Security

- The `claude` SQL login should only ever have `SELECT` granted on the
  `claude` schema — never on base tables, never `INSERT`/`UPDATE`/`DELETE`,
  never `db_datareader`. That grant is what makes this read-only; there is no
  application-level write guard to fall back on.
- Every query is parameterized via `tedious`'s `addParameter` (see
  `tools/mssql/connection.ts`'s `QueryParam`) — filter values from tool
  callers are never string-interpolated into SQL.
- List tools cap page size (`limit`, max 100–200 depending on the tool) and
  always return pagination metadata so callers know if more data exists.
- `/stormwater/chat` (and its `DELETE`) are the only Entra-gated routes —
  the raw MCP endpoint (`POST /stormwater`) has no bearer-token check, by
  design, for MCP clients that can't do an OAuth/MSAL flow. Don't assume
  opening this server up publicly for the chat panel also locks down the MCP
  endpoint; that's a separate decision.

## Error Handling

Every tool wraps its logic in try/catch and returns errors as normal MCP text
content (via `describeError`) rather than throwing, so Claude sees a readable
error message instead of a broken tool call.
