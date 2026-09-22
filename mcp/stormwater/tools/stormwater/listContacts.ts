import { TYPES } from "tedious"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { z } from "zod"

export const listContactsTool = {
  name: "stormwater_list_contacts",
  description: "List/search stormwater CONTACTS -- external people or organizations associated with a site (site owners, contractors, property managers). This is NOT for City of Franklin inspectors/city staff -- for a question about an inspector, use stormwater_list_inspectors instead, not this tool. Use this to resolve a contact's name to a contactId before calling stormwater_get_contact_sites or stormwater_get_contact_activity.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25, max 100)"),
    offset: z.number().int().min(0).optional().describe("Rows to skip (default 0)"),
    search: z.string().optional().describe("Case-insensitive substring match against the contact's name or company"),
    activeOnly: z.boolean().optional().describe("Exclude contacts marked inactive (default false)"),
  }),
  handler: (async ({ limit = 25, offset = 0, search, activeOnly }: {
    limit?: number
    offset?: number
    search?: string
    activeOnly?: boolean
  }) => {
    try {
      const conditions: string[] = []
      const params: QueryParam[] = []

      if(search !== undefined) {
        conditions.push("(name LIKE @search OR company LIKE @search)")
        params.push({ name: "search", type: TYPES.VarChar, value: `%${ search }%` })
      }
      if(activeOnly) {
        conditions.push("inactive = 0")
      }

      const whereClause = conditions.length > 0 ? `WHERE ${ conditions.join(" AND ") }` : ""

      const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM contacts ${ whereClause }`, params)
      const total = countResult.rows[0]?.total ?? 0

      const rowsResult = await executeQuery(
        `SELECT * FROM contacts ${ whereClause } ORDER BY name OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [...params, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )

      return { content: [{ type: "text" as const, text: JSON.stringify(paginate(rowsResult.rows, total, offset, limit), null, 2) }] }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error listing contacts: ${ describeError(error) }` }] }
    }
  }) as any,
}
