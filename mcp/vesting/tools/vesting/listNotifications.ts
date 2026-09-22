import { TYPES } from "tedious"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { parseLocalDate } from "../../utils/filters"
import { z } from "zod"

export const listNotificationsTool = {
  name: "vesting_list_notifications",
  description: "List vesting notifications (Initial / Last Call / Lost Vesting) by date -- the vesting-expiration lifecycle markers for a project. This is the best tool for \"what's coming up\" across projects. Supports filtering and pagination.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(200).optional().describe("Max rows to return (default 50, max 200)"),
    offset: z.number().int().min(0).optional().describe("Rows to skip (default 0)"),
    projectUuid: z.string().optional().describe("Only notifications for this project (matches project.uuid, stored directly as notification.parentId)"),
    type: z.enum(["Initial", "Last Call", "Lost Vesting"]).optional().describe("Filter to this notification type"),
    dateFrom: z.string().optional().describe("Only notifications on/after this date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("Only notifications on/before this date (YYYY-MM-DD)"),
  }),
  handler: (async ({ limit = 50, offset = 0, projectUuid, type, dateFrom, dateTo }: {
    limit?: number
    offset?: number
    projectUuid?: string
    type?: string
    dateFrom?: string
    dateTo?: string
  }) => {
    try {
      const conditions: string[] = []
      const params: QueryParam[] = []

      // notification.parentId stores the PROJECT's uuid directly (Sequelize:
      // belongsTo(Project, { targetKey: 'uuid', foreignKey: 'parentId' })).
      if(projectUuid !== undefined) {
        conditions.push("parentId = @projectUuid")
        params.push({ name: "projectUuid", type: TYPES.UniqueIdentifier, value: projectUuid })
      }
      if(type !== undefined) {
        conditions.push("type = @type")
        params.push({ name: "type", type: TYPES.VarChar, value: type })
      }
      if(dateFrom !== undefined) {
        conditions.push("date >= @dateFrom")
        params.push({ name: "dateFrom", type: TYPES.Date, value: parseLocalDate(dateFrom) })
      }
      if(dateTo !== undefined) {
        conditions.push("date <= @dateTo")
        params.push({ name: "dateTo", type: TYPES.Date, value: parseLocalDate(dateTo) })
      }

      const whereClause = conditions.length > 0 ? `WHERE ${ conditions.join(" AND ") }` : ""

      const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM notification ${ whereClause }`, params)
      const total = countResult.rows[0]?.total ?? 0

      const rowsResult = await executeQuery(
        `SELECT * FROM notification ${ whereClause } ORDER BY date OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [...params, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )

      return { content: [{ type: "text" as const, text: JSON.stringify(paginate(rowsResult.rows, total, offset, limit), null, 2) }] }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error listing notifications: ${ describeError(error) }` }] }
    }
  }) as any,
}
