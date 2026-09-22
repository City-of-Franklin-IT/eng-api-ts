import { TYPES } from "tedious"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { parseLocalDate, resolveDateRange } from "../../utils/filters"
import { z } from "zod"

// Unifies three date-centric enforcement concepts that otherwise live in
// different places -- follow_up_dates (its own table), and penaltyDueDate/
// swoDate (columns directly on violations/illicit_discharges, with no
// cross-record way to ask "what's coming due" today). Each branch is
// normalized to the same shape so a single ORDER BY/OFFSET-FETCH over the
// UNION ALL paginates and counts correctly at the DB level, rather than
// merging three separately-paginated result sets in JS.
//
// "resolved" is the one concept standing in for three different underlying
// signals: a follow-up's parent record being closed, a penalty actually
// being paid, or a stop-work-order actually being lifted.
const DEADLINES_CTE = `
  WITH deadlines AS (
    SELECT
      'follow_up' AS itemType, f.followUpDate AS itemDate,
      COALESCE(v.siteId, c.siteId, idis.siteId) AS siteId,
      COALESCE(v.siteName, c.siteName, idis.siteName) AS siteName,
      COALESCE(v.inspectorId, c.inspectorId, idis.inspectorId) AS inspectorId,
      COALESCE(v.inspectorName, c.inspectorName, idis.inspectorName) AS inspectorName,
      CASE
        WHEN NULLIF(f.violationId, '') IS NOT NULL THEN 'violation'
        WHEN NULLIF(f.complaintId, '') IS NOT NULL THEN 'complaint'
        WHEN NULLIF(f.illicitId, '') IS NOT NULL THEN 'illicit_discharge'
        ELSE 'unknown'
      END AS recordType,
      COALESCE(NULLIF(f.violationId, ''), NULLIF(f.complaintId, ''), NULLIF(f.illicitId, '')) AS recordId,
      CAST(COALESCE(v.closed, c.closed, idis.closed) AS bit) AS resolved,
      CAST(NULL AS decimal(18,2)) AS amount
    FROM follow_up_dates f
    LEFT JOIN violations v ON v.violationId = f.violationId
    LEFT JOIN complaints c ON c.complaintId = f.complaintId
    LEFT JOIN illicit_discharges idis ON idis.illicitId = f.illicitId

    UNION ALL

    SELECT
      'payment_due', v.penaltyDueDate, v.siteId, v.siteName, v.inspectorId, v.inspectorName,
      'violation', v.violationId,
      CAST(CASE WHEN v.paymentReceived IS NOT NULL THEN 1 ELSE 0 END AS bit), v.penaltyAmount
    FROM violations v
    WHERE v.penaltyDueDate IS NOT NULL

    UNION ALL

    SELECT
      'payment_due', idis.penaltyDueDate, idis.siteId, idis.siteName, idis.inspectorId, idis.inspectorName,
      'illicit_discharge', idis.illicitId,
      CAST(CASE WHEN idis.paymentReceived IS NOT NULL THEN 1 ELSE 0 END AS bit), idis.penaltyAmount
    FROM illicit_discharges idis
    WHERE idis.penaltyDueDate IS NOT NULL

    UNION ALL

    SELECT
      'stop_work_order', v.swoDate, v.siteId, v.siteName, v.inspectorId, v.inspectorName,
      'violation', v.violationId,
      CAST(CASE WHEN v.swoLiftedDate IS NOT NULL THEN 1 ELSE 0 END AS bit), CAST(NULL AS decimal(18,2))
    FROM violations v
    WHERE v.swoDate IS NOT NULL
  )
`

export const listEnforcementDeadlinesTool = {
  name: "stormwater_list_enforcement_deadlines",
  description: "List date-centric enforcement items in one merged, chronological feed: follow-up dates, unpaid penalty due dates, and active stop-work-orders. Use this for \"what's coming up / overdue\" questions instead of piecing it together from stormwater_list_follow_up_dates plus manually reading penaltyDueDate/swoDate off individual violations.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25, max 100)"),
    offset: z.number().int().min(0).optional().describe("Rows to skip (default 0)"),
    type: z.enum(["follow_up", "payment_due", "stop_work_order"]).optional().describe("Only this kind of deadline"),
    siteId: z.string().optional().describe("Only deadlines for this site (matches sites.siteId, not uuid)"),
    inspectorSlug: z.string().optional().describe("Only deadlines whose record's assigned inspector matches this slug, as returned by stormwater_list_inspectors"),
    fiscalYear: z.string().optional().describe("Only deadlines in this fiscal year, e.g. \"2025\" for 2024-07-01 through 2025-06-30. Takes precedence over dateFrom/dateTo if both given."),
    dateFrom: z.string().optional().describe("Only deadlines on/after this date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("Only deadlines on/before this date (YYYY-MM-DD)"),
    overdue: z.boolean().optional().describe("Only deadlines whose date has passed and are still unresolved (as of the server's current date) -- a penalty paid on time or a lifted SWO doesn't count even if its date is in the past"),
    resolved: z.boolean().optional().describe("Filter to resolved (true: closed follow-up / penalty paid / SWO lifted) or unresolved (false) deadlines"),
  }),
  handler: (async ({ limit = 25, offset = 0, type, siteId, inspectorSlug, fiscalYear, dateFrom, dateTo, overdue, resolved }: {
    limit?: number
    offset?: number
    type?: "follow_up" | "payment_due" | "stop_work_order"
    siteId?: string
    inspectorSlug?: string
    fiscalYear?: string
    dateFrom?: string
    dateTo?: string
    overdue?: boolean
    resolved?: boolean
  }) => {
    try {
      ({ dateFrom, dateTo } = resolveDateRange({ fiscalYear, dateFrom, dateTo }))

      const conditions: string[] = []
      const params: QueryParam[] = []

      if(type !== undefined) {
        conditions.push("itemType = @type")
        params.push({ name: "type", type: TYPES.VarChar, value: type })
      }
      if(siteId !== undefined) {
        conditions.push("siteId = @siteId")
        params.push({ name: "siteId", type: TYPES.VarChar, value: siteId })
      }
      if(inspectorSlug !== undefined) {
        conditions.push("inspectorId = (SELECT inspectorId FROM inspectors WHERE slug = @inspectorSlug)")
        params.push({ name: "inspectorSlug", type: TYPES.VarChar, value: inspectorSlug })
      }
      if(dateFrom !== undefined) {
        conditions.push("itemDate >= @dateFrom")
        params.push({ name: "dateFrom", type: TYPES.Date, value: parseLocalDate(dateFrom) })
      }
      if(dateTo !== undefined) {
        conditions.push("itemDate <= @dateTo")
        params.push({ name: "dateTo", type: TYPES.Date, value: parseLocalDate(dateTo) })
      }
      if(overdue) {
        conditions.push("itemDate < CAST(GETDATE() AS DATE) AND resolved = 0")
      }
      if(resolved !== undefined) {
        conditions.push("resolved = @resolved")
        params.push({ name: "resolved", type: TYPES.Bit, value: resolved })
      }

      const whereClause = conditions.length > 0 ? `WHERE ${ conditions.join(" AND ") }` : ""

      const countResult = await executeQuery(
        `${ DEADLINES_CTE } SELECT COUNT(*) AS total FROM deadlines ${ whereClause }`,
        params
      )
      const total = countResult.rows[0]?.total ?? 0

      const rowsResult = await executeQuery(
        `${ DEADLINES_CTE } SELECT * FROM deadlines ${ whereClause } ORDER BY itemDate ASC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [...params, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )

      return { content: [{ type: "text" as const, text: JSON.stringify(paginate(rowsResult.rows, total, offset, limit), null, 2) }] }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error listing enforcement deadlines: ${ describeError(error) }` }] }
    }
  }) as any,
}
