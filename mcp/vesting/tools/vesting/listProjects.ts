import { TYPES } from "tedious"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { z } from "zod"

export const listProjectsTool = {
  name: "vesting_list_projects",
  description: "List vesting projects (Development Plan / Preliminary Plat / Site Plan) with COF number, ordinance date, and expired status. Supports search and pagination. Use vesting_get_project for a single project's full milestone/vesting-period/approval detail.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25, max 100)"),
    offset: z.number().int().min(0).optional().describe("Rows to skip (default 0)"),
    type: z.enum(["Development Plan", "Preliminary Plat", "Site Plan"]).optional().describe("Filter to this project type"),
    search: z.string().optional().describe("Substring match against name, cof, or ordinance date"),
    expired: z.boolean().optional().describe("Filter to expired (true) or active (false) projects"),
  }),
  handler: (async ({ limit = 25, offset = 0, type, search, expired }: {
    limit?: number
    offset?: number
    type?: string
    search?: string
    expired?: boolean
  }) => {
    try {
      const conditions: string[] = []
      const params: QueryParam[] = []

      if(type !== undefined) {
        conditions.push("type = @type")
        params.push({ name: "type", type: TYPES.VarChar, value: type })
      }
      if(search !== undefined) {
        conditions.push("(name LIKE @search OR CAST(cof AS VARCHAR(50)) LIKE @search OR CONVERT(VARCHAR(10), ordinance, 23) LIKE @search)")
        params.push({ name: "search", type: TYPES.VarChar, value: `%${ search }%` })
      }
      if(expired !== undefined) {
        conditions.push("expired = @expired")
        params.push({ name: "expired", type: TYPES.Bit, value: expired })
      }

      const whereClause = conditions.length > 0 ? `WHERE ${ conditions.join(" AND ") }` : ""

      const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM project ${ whereClause }`, params)
      const total = countResult.rows[0]?.total ?? 0

      const rowsResult = await executeQuery(
        `SELECT * FROM project ${ whereClause } ORDER BY name OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [...params, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )

      return { content: [{ type: "text" as const, text: JSON.stringify(paginate(rowsResult.rows, total, offset, limit), null, 2) }] }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error listing projects: ${ describeError(error) }` }] }
    }
  }) as any,
}
