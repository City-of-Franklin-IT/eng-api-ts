import { TYPES } from "tedious"
import { executeQuery } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { buildClosedSiteDateFilter } from "../../utils/filters"
import { z } from "zod"

export const listIllicitDischargesTool = {
  name: "stormwater_list_illicit_discharges",
  description: "List illicit discharge records with site, inspector, and enforcement/penalty details. Supports filtering and pagination.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25, max 100)"),
    offset: z.number().int().min(0).optional().describe("Rows to skip (default 0)"),
    siteId: z.string().optional().describe("Only discharges for this site (matches sites.siteId, not uuid)"),
    closed: z.boolean().optional().describe("Filter to closed (true) or open (false) discharges"),
    dateFrom: z.string().optional().describe("Only discharges on/after this date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("Only discharges on/before this date (YYYY-MM-DD)"),
  }),
  handler: (async ({ limit = 25, offset = 0, siteId, closed, dateFrom, dateTo }: {
    limit?: number
    offset?: number
    siteId?: string
    closed?: boolean
    dateFrom?: string
    dateTo?: string
  }) => {
    try {
      const { conditions, params } = buildClosedSiteDateFilter({ siteId, closed, dateFrom, dateTo })
      const whereClause = conditions.length > 0 ? `WHERE ${ conditions.join(" AND ") }` : ""

      const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM illicit_discharges ${ whereClause }`, params)
      const total = countResult.rows[0]?.total ?? 0

      const rowsResult = await executeQuery(
        `SELECT * FROM illicit_discharges ${ whereClause } ORDER BY date DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [...params, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )

      return { content: [{ type: "text" as const, text: JSON.stringify(paginate(rowsResult.rows, total, offset, limit), null, 2) }] }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error listing illicit discharges: ${ describeError(error) }` }] }
    }
  }) as any,
}
