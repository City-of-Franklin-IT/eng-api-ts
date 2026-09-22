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
    inspectorSlug: z.string().optional().describe("Only discharges logged against this inspector (matches inspectors.slug)"),
    closed: z.boolean().optional().describe("Filter to closed (true) or open (false) discharges"),
    fiscalYear: z.string().optional().describe("Only discharges in this fiscal year, e.g. \"2025\" for 2024-07-01 through 2025-06-30. Takes precedence over dateFrom/dateTo if both given."),
    dateFrom: z.string().optional().describe("Only discharges on/after this date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("Only discharges on/before this date (YYYY-MM-DD)"),
  }),
  handler: (async ({ limit = 25, offset = 0, siteId, inspectorSlug, closed, fiscalYear, dateFrom, dateTo }: {
    limit?: number
    offset?: number
    siteId?: string
    inspectorSlug?: string
    closed?: boolean
    fiscalYear?: string
    dateFrom?: string
    dateTo?: string
  }) => {
    try {
      const { conditions, params } = buildClosedSiteDateFilter({ siteId, inspectorSlug, closed, fiscalYear, dateFrom, dateTo })
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
