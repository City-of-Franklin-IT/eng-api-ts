import { TYPES } from "tedious"
import { executeQuery } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { z } from "zod"

export const listInspectorsTool = {
  name: "stormwater_list_inspectors",
  description: "List City of Franklin stormwater INSPECTORS -- the small, fixed roster of city staff who inspect sites and are assigned to them (sites.inspectorSlug). This is a different concept from a \"contact\" (stormwater_list_contacts), which is an external person like a site owner or contractor. If a question names a person and it's unclear which they are, check here FIRST -- this list is small enough to fetch in full and scan by eye, no search param needed.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25, max 100)"),
    offset: z.number().int().min(0).optional().describe("Rows to skip (default 0)"),
    activeOnly: z.boolean().optional().describe("Exclude inspectors marked inactive (default false)"),
  }),
  handler: (async ({ limit = 25, offset = 0, activeOnly }: { limit?: number; offset?: number; activeOnly?: boolean }) => {
    try {
      const whereClause = activeOnly ? "WHERE inactive = 0" : ""

      const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM inspectors ${ whereClause }`)
      const total = countResult.rows[0]?.total ?? 0

      const rowsResult = await executeQuery(
        `SELECT * FROM inspectors ${ whereClause } ORDER BY name OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [{ name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )

      return { content: [{ type: "text" as const, text: JSON.stringify(paginate(rowsResult.rows, total, offset, limit), null, 2) }] }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error listing inspectors: ${ describeError(error) }` }] }
    }
  }) as any,
}
