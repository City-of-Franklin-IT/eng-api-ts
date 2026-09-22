import { TYPES } from "tedious"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { parseLocalDate, resolveDateRange } from "../../utils/filters"
import { z } from "zod"

// follow_up_dates ties to exactly one of violationId/complaintId/illicitId
// (or greenId -- there's no claude.green view yet, so a green-linked row
// can't be resolved to a site/inspector/closed status here, only its raw id).
// Joining back to the violations/complaints/illicit_discharges *views* (not
// the dbo base tables) reuses their existing site/inspector resolution,
// including the createdBy fallback for records with no assigned inspector.
const FROM_CLAUSE = `
  FROM follow_up_dates f
  LEFT JOIN violations v ON v.violationId = f.violationId
  LEFT JOIN complaints c ON c.complaintId = f.complaintId
  LEFT JOIN illicit_discharges idis ON idis.illicitId = f.illicitId
`

export const listFollowUpDatesTool = {
  name: "stormwater_list_follow_up_dates",
  description: "List follow-up dates tied to violations, complaints, and illicit discharges, with the site, inspector, and parent-record open/closed status resolved. Supports filtering (including overdue-only) and pagination.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25, max 100)"),
    offset: z.number().int().min(0).optional().describe("Rows to skip (default 0)"),
    siteId: z.string().optional().describe("Only follow-ups for this site (matches sites.siteId, not uuid)"),
    inspectorSlug: z.string().optional().describe("Only follow-ups whose parent record's assigned inspector matches this slug, as returned by stormwater_list_inspectors"),
    fiscalYear: z.string().optional().describe("Only follow-ups in this fiscal year, e.g. \"2025\" for 2024-07-01 through 2025-06-30. Takes precedence over dateFrom/dateTo if both given."),
    dateFrom: z.string().optional().describe("Only follow-ups on/after this date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("Only follow-ups on/before this date (YYYY-MM-DD)"),
    overdue: z.boolean().optional().describe("Only follow-ups whose date has already passed (as of the server's current date)"),
    closed: z.boolean().optional().describe("Filter by whether the parent violation/complaint/illicit discharge is closed (true) or still open (false)"),
  }),
  handler: (async ({ limit = 25, offset = 0, siteId, inspectorSlug, fiscalYear, dateFrom, dateTo, overdue, closed }: {
    limit?: number
    offset?: number
    siteId?: string
    inspectorSlug?: string
    fiscalYear?: string
    dateFrom?: string
    dateTo?: string
    overdue?: boolean
    closed?: boolean
  }) => {
    try {
      ({ dateFrom, dateTo } = resolveDateRange({ fiscalYear, dateFrom, dateTo }))

      if(inspectorSlug !== undefined) {
        const inspectorResult = await executeQuery(
          "SELECT inspectorId FROM inspectors WHERE slug = @slug",
          [{ name: "slug", type: TYPES.VarChar, value: inspectorSlug }]
        )
        if(!inspectorResult.rows[0]) {
          return { content: [{ type: "text" as const, text: `No inspector found with slug ${ inspectorSlug }` }] }
        }
      }

      const conditions: string[] = []
      const params: QueryParam[] = []

      if(siteId !== undefined) {
        conditions.push("COALESCE(v.siteId, c.siteId, idis.siteId) = @siteId")
        params.push({ name: "siteId", type: TYPES.VarChar, value: siteId })
      }
      if(inspectorSlug !== undefined) {
        // Matches on inspectors.slug via a correlated lookup rather than a
        // second round-trip, since executeQuery serializes requests anyway
        // (see connection.ts) -- one query is simpler than threading the
        // inspectorId looked up above through both the count and rows queries.
        conditions.push("COALESCE(v.inspectorId, c.inspectorId, idis.inspectorId) = (SELECT inspectorId FROM inspectors WHERE slug = @inspectorSlug)")
        params.push({ name: "inspectorSlug", type: TYPES.VarChar, value: inspectorSlug })
      }
      if(dateFrom !== undefined) {
        conditions.push("f.followUpDate >= @dateFrom")
        params.push({ name: "dateFrom", type: TYPES.Date, value: parseLocalDate(dateFrom) })
      }
      if(dateTo !== undefined) {
        conditions.push("f.followUpDate <= @dateTo")
        params.push({ name: "dateTo", type: TYPES.Date, value: parseLocalDate(dateTo) })
      }
      if(overdue) {
        conditions.push("f.followUpDate < CAST(GETDATE() AS DATE)")
      }
      if(closed !== undefined) {
        conditions.push("COALESCE(v.closed, c.closed, idis.closed) = @closed")
        params.push({ name: "closed", type: TYPES.Bit, value: closed })
      }

      const whereClause = conditions.length > 0 ? `WHERE ${ conditions.join(" AND ") }` : ""

      const countResult = await executeQuery(`SELECT COUNT(*) AS total ${ FROM_CLAUSE } ${ whereClause }`, params)
      const total = countResult.rows[0]?.total ?? 0

      const rowsResult = await executeQuery(
        `SELECT
           f.uuid, f.followUpId, f.followUpDate,
           CASE
             WHEN NULLIF(f.violationId, '') IS NOT NULL THEN 'violation'
             WHEN NULLIF(f.complaintId, '') IS NOT NULL THEN 'complaint'
             WHEN NULLIF(f.illicitId, '') IS NOT NULL THEN 'illicit_discharge'
             WHEN NULLIF(f.greenId, '') IS NOT NULL THEN 'green'
             ELSE 'unknown'
           END AS recordType,
           -- Some rows store '' instead of NULL for the FKs that don't apply
           -- (confirmed via live testing: 26/182 rows had violationId='' while
           -- actually keyed by complaintId/illicitId) -- normalize to NULL here
           -- so a row's populated-FK output matches its recordType.
           NULLIF(f.violationId, '') AS violationId,
           NULLIF(f.complaintId, '') AS complaintId,
           NULLIF(f.illicitId, '') AS illicitId,
           NULLIF(f.greenId, '') AS greenId,
           COALESCE(v.siteId, c.siteId, idis.siteId) AS siteId,
           COALESCE(v.siteName, c.siteName, idis.siteName) AS siteName,
           COALESCE(v.inspectorId, c.inspectorId, idis.inspectorId) AS inspectorId,
           COALESCE(v.inspectorName, c.inspectorName, idis.inspectorName) AS inspectorName,
           COALESCE(v.closed, c.closed, idis.closed) AS closed,
           f.createdBy, f.createdAt, f.updatedBy, f.updatedAt
         ${ FROM_CLAUSE } ${ whereClause }
         ORDER BY f.followUpDate ASC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [...params, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )

      return { content: [{ type: "text" as const, text: JSON.stringify(paginate(rowsResult.rows, total, offset, limit), null, 2) }] }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error listing follow-up dates: ${ describeError(error) }` }] }
    }
  }) as any,
}
