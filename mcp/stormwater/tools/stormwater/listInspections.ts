import { TYPES } from "tedious"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { parseLocalDate, resolveDateRange } from "../../utils/filters"
import { z } from "zod"

export const listInspectionsTool = {
  name: "stormwater_list_inspections",
  description: "List stormwater inspection logs with site and date filtering and pagination. Also returns distinctSiteCount, the number of distinct sites inspected within the given date range -- use that to answer \"how many sites were inspected between X and Y\" without paging through every log row. logs has no inspector column of its own -- inspectorSlug filters via the site's assigned inspector (sites.inspectorSlug), which is safe here because a site keeps the same assigned inspector for its whole lifespan.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25, max 100)"),
    offset: z.number().int().min(0).optional().describe("Rows to skip (default 0)"),
    siteId: z.string().optional().describe("Only inspections for this site (matches sites.siteId, not uuid)"),
    inspectorSlug: z.string().optional().describe("Only inspections at sites assigned to this inspector (matches inspectors.slug)"),
    fiscalYear: z.string().optional().describe("Only inspections in this fiscal year, e.g. \"2025\" for 2024-07-01 through 2025-06-30. Takes precedence over dateFrom/dateTo if both given."),
    dateFrom: z.string().optional().describe("Only inspections on/after this date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("Only inspections on/before this date (YYYY-MM-DD)"),
  }),
  handler: (async ({ limit = 25, offset = 0, siteId, inspectorSlug, fiscalYear, dateFrom, dateTo }: {
    limit?: number
    offset?: number
    siteId?: string
    inspectorSlug?: string
    fiscalYear?: string
    dateFrom?: string
    dateTo?: string
  }) => {
    try {
      ({ dateFrom, dateTo } = resolveDateRange({ fiscalYear, dateFrom, dateTo }))

      // logs has no inspector column, so filtering by inspector requires
      // joining to sites -- only do that join when inspectorSlug is actually
      // used, so the common (no inspector filter) case stays a plain SELECT.
      const fromClause = inspectorSlug !== undefined ? "logs l JOIN sites s ON l.siteId = s.siteId" : "logs"
      const siteIdCol = inspectorSlug !== undefined ? "l.siteId" : "siteId"
      const dateCol = inspectorSlug !== undefined ? "l.inspectionDate" : "inspectionDate"

      const conditions: string[] = []
      const params: QueryParam[] = []

      if(siteId !== undefined) {
        conditions.push(`${ siteIdCol } = @siteId`)
        params.push({ name: "siteId", type: TYPES.VarChar, value: siteId })
      }
      if(inspectorSlug !== undefined) {
        conditions.push("s.inspectorSlug = @inspectorSlug")
        params.push({ name: "inspectorSlug", type: TYPES.VarChar, value: inspectorSlug })
      }
      if(dateFrom !== undefined) {
        conditions.push(`${ dateCol } >= @dateFrom`)
        params.push({ name: "dateFrom", type: TYPES.Date, value: parseLocalDate(dateFrom) })
      }
      if(dateTo !== undefined) {
        conditions.push(`${ dateCol } <= @dateTo`)
        params.push({ name: "dateTo", type: TYPES.Date, value: parseLocalDate(dateTo) })
      }

      const whereClause = conditions.length > 0 ? `WHERE ${ conditions.join(" AND ") }` : ""
      const selectCols = inspectorSlug !== undefined ? "l.*" : "*"

      const countResult = await executeQuery(
        `SELECT COUNT(*) AS total, COUNT(DISTINCT ${ siteIdCol }) AS distinctSiteCount FROM ${ fromClause } ${ whereClause }`,
        params
      )
      const total = countResult.rows[0]?.total ?? 0
      const distinctSiteCount = countResult.rows[0]?.distinctSiteCount ?? 0

      const rowsResult = await executeQuery(
        `SELECT ${ selectCols } FROM ${ fromClause } ${ whereClause } ORDER BY ${ dateCol } DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [...params, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ ...paginate(rowsResult.rows, total, offset, limit), distinctSiteCount }, null, 2),
        }],
      }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error listing inspections: ${ describeError(error) }` }] }
    }
  }) as any,
}
