import { TYPES } from "tedious"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { parseLocalDate } from "../../utils/filters"
import { z } from "zod"

export const listInspectionsTool = {
  name: "stormwater_list_inspections",
  description: "List stormwater inspection logs with site and date filtering and pagination. Also returns distinctSiteCount, the number of distinct sites inspected within the given date range -- use that to answer \"how many sites were inspected between X and Y\" without paging through every log row.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25, max 100)"),
    offset: z.number().int().min(0).optional().describe("Rows to skip (default 0)"),
    siteId: z.string().optional().describe("Only inspections for this site (matches sites.siteId, not uuid)"),
    dateFrom: z.string().optional().describe("Only inspections on/after this date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("Only inspections on/before this date (YYYY-MM-DD)"),
  }),
  handler: (async ({ limit = 25, offset = 0, siteId, dateFrom, dateTo }: {
    limit?: number
    offset?: number
    siteId?: string
    dateFrom?: string
    dateTo?: string
  }) => {
    try {
      const conditions: string[] = []
      const params: QueryParam[] = []

      if(siteId !== undefined) {
        conditions.push("siteId = @siteId")
        params.push({ name: "siteId", type: TYPES.VarChar, value: siteId })
      }
      if(dateFrom !== undefined) {
        conditions.push("inspectionDate >= @dateFrom")
        params.push({ name: "dateFrom", type: TYPES.Date, value: parseLocalDate(dateFrom) })
      }
      if(dateTo !== undefined) {
        conditions.push("inspectionDate <= @dateTo")
        params.push({ name: "dateTo", type: TYPES.Date, value: parseLocalDate(dateTo) })
      }

      const whereClause = conditions.length > 0 ? `WHERE ${ conditions.join(" AND ") }` : ""

      const countResult = await executeQuery(
        `SELECT COUNT(*) AS total, COUNT(DISTINCT siteId) AS distinctSiteCount FROM logs ${ whereClause }`,
        params
      )
      const total = countResult.rows[0]?.total ?? 0
      const distinctSiteCount = countResult.rows[0]?.distinctSiteCount ?? 0

      const rowsResult = await executeQuery(
        `SELECT * FROM logs ${ whereClause } ORDER BY inspectionDate DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
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
