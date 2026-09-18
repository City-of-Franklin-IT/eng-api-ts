import { TYPES } from "tedious"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { z } from "zod"

export const listSitesTool = {
  name: "stormwater_list_sites",
  description: "List stormwater construction sites with inspector assignment and open-violation/complaint/illicit-discharge status flags. Supports filtering and pagination.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25, max 100)"),
    offset: z.number().int().min(0).optional().describe("Rows to skip (default 0)"),
    inspectorSlug: z.string().optional().describe("Only sites assigned to this inspector (matches inspectors.slug)"),
    hasOpenViolation: z.boolean().optional().describe("Filter to sites with (true) or without (false) an open construction violation"),
    hasOpenComplaint: z.boolean().optional().describe("Filter to sites with (true) or without (false) an open complaint"),
    hasOpenIllicitDischarge: z.boolean().optional().describe("Filter to sites with (true) or without (false) an open illicit discharge"),
    activeOnly: z.boolean().optional().describe("Exclude sites marked inactive (default false)"),
  }),
  handler: (async ({ limit = 25, offset = 0, inspectorSlug, hasOpenViolation, hasOpenComplaint, hasOpenIllicitDischarge, activeOnly }: {
    limit?: number
    offset?: number
    inspectorSlug?: string
    hasOpenViolation?: boolean
    hasOpenComplaint?: boolean
    hasOpenIllicitDischarge?: boolean
    activeOnly?: boolean
  }) => {
    try {
      const conditions: string[] = []
      const params: QueryParam[] = []

      if(inspectorSlug !== undefined) {
        conditions.push("inspectorSlug = @inspectorSlug")
        params.push({ name: "inspectorSlug", type: TYPES.VarChar, value: inspectorSlug })
      }
      if(hasOpenViolation !== undefined) {
        conditions.push("hasOpenViolation = @hasOpenViolation")
        params.push({ name: "hasOpenViolation", type: TYPES.Bit, value: hasOpenViolation })
      }
      if(hasOpenComplaint !== undefined) {
        conditions.push("hasOpenComplaint = @hasOpenComplaint")
        params.push({ name: "hasOpenComplaint", type: TYPES.Bit, value: hasOpenComplaint })
      }
      if(hasOpenIllicitDischarge !== undefined) {
        conditions.push("hasOpenIllicitDischarge = @hasOpenIllicitDischarge")
        params.push({ name: "hasOpenIllicitDischarge", type: TYPES.Bit, value: hasOpenIllicitDischarge })
      }
      if(activeOnly) {
        conditions.push("isActive = 1")
      }

      const whereClause = conditions.length > 0 ? `WHERE ${ conditions.join(" AND ") }` : ""

      const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM sites ${ whereClause }`, params)
      const total = countResult.rows[0]?.total ?? 0

      const rowsResult = await executeQuery(
        `SELECT * FROM sites ${ whereClause } ORDER BY name OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [...params, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )

      return {
        content: [{ type: "text" as const, text: JSON.stringify(paginate(rowsResult.rows, total, offset, limit), null, 2) }],
      }
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: `Error listing sites: ${ describeError(error) }` }],
      }
    }
  }) as any,
}
