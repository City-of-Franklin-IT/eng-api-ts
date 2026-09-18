import { TYPES } from "tedious"
import { executeQuery } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { z } from "zod"

export const listActiveSitesTool = {
  name: "stormwater_list_active_sites",
  description: "List active (not inactive-flagged) stormwater sites with a slim, map-friendly field set (name, permit, cof, tnq, coordinates).",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(200).optional().describe("Max rows to return (default 50, max 200)"),
    offset: z.number().int().min(0).optional().describe("Rows to skip (default 0)"),
  }),
  handler: (async ({ limit = 50, offset = 0 }: { limit?: number; offset?: number }) => {
    try {
      const countResult = await executeQuery("SELECT COUNT(*) AS total FROM active_sites")
      const total = countResult.rows[0]?.total ?? 0

      const rowsResult = await executeQuery(
        "SELECT * FROM active_sites ORDER BY name OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY",
        [{ name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )

      return { content: [{ type: "text" as const, text: JSON.stringify(paginate(rowsResult.rows, total, offset, limit), null, 2) }] }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error listing active sites: ${ describeError(error) }` }] }
    }
  }) as any,
}
