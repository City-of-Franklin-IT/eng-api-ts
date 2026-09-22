import { TYPES } from "tedious"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { parseLocalDate } from "../../utils/filters"
import { z } from "zod"

// milestone.parentId stores the PROJECT's uuid directly (Sequelize:
// belongsTo(Project, { targetKey: 'uuid', foreignKey: 'parentId' })), and
// extension.parentId / milestone_status.parentId store the MILESTONE's uuid
// one level down -- so this needs no join through an internal numeric id.
// effectiveDate mirrors project-vesting-vite-ts's client-side override
// exactly: an extension's date wins over the milestone's own date whenever
// one exists. Wrapped in a CTE so dateFrom/dateTo/projectType filters (in
// the outer WHERE) can reference the computed effectiveDate/projectType
// columns -- SQL Server can't reference a SELECT-list alias in that same
// SELECT's own WHERE clause.
const MILESTONES_DUE_CTE = `
  WITH milestones_due AS (
    SELECT
      m.uuid, m.number, m.date, m.parentId AS projectUuid, m.createdAt, m.updatedAt,
      e.date AS extensionDate,
      COALESCE(e.date, m.date) AS effectiveDate,
      ms.achieved, ms.expired,
      p.type AS projectType, p.name AS projectName
    FROM milestone m
    LEFT JOIN extension e ON e.parentId = m.uuid
    LEFT JOIN milestone_status ms ON ms.parentId = m.uuid
    JOIN project p ON p.uuid = m.parentId
  )
`

export const listMilestonesDueTool = {
  name: "vesting_list_milestones_due",
  description: "List milestones by their EFFECTIVE due date -- an extension's date if one exists on that milestone, otherwise the milestone's own date. This is the correct way to answer \"what's due/was due between X and Y\"; the base milestone date alone ignores extensions and can give wrong answers. Supports filtering and pagination.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(200).optional().describe("Max rows to return (default 50, max 200)"),
    offset: z.number().int().min(0).optional().describe("Rows to skip (default 0)"),
    projectUuid: z.string().optional().describe("Only milestones for this project (matches project.uuid)"),
    dateFrom: z.string().optional().describe("Only milestones with effective date on/after this date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("Only milestones with effective date on/before this date (YYYY-MM-DD)"),
    achieved: z.boolean().optional().describe("Filter to achieved (true) or not-yet-achieved (false) milestones"),
    expired: z.boolean().optional().describe("Filter to expired (true) or not-expired (false) milestones"),
    projectType: z.enum(["Development Plan", "Preliminary Plat", "Site Plan"]).optional().describe("Filter to milestones on projects of this type"),
  }),
  handler: (async ({ limit = 50, offset = 0, projectUuid, dateFrom, dateTo, achieved, expired, projectType }: {
    limit?: number
    offset?: number
    projectUuid?: string
    dateFrom?: string
    dateTo?: string
    achieved?: boolean
    expired?: boolean
    projectType?: string
  }) => {
    try {
      const conditions: string[] = []
      const params: QueryParam[] = []

      if(projectUuid !== undefined) {
        conditions.push("projectUuid = @projectUuid")
        params.push({ name: "projectUuid", type: TYPES.UniqueIdentifier, value: projectUuid })
      }
      if(dateFrom !== undefined) {
        conditions.push("effectiveDate >= @dateFrom")
        params.push({ name: "dateFrom", type: TYPES.Date, value: parseLocalDate(dateFrom) })
      }
      if(dateTo !== undefined) {
        conditions.push("effectiveDate <= @dateTo")
        params.push({ name: "dateTo", type: TYPES.Date, value: parseLocalDate(dateTo) })
      }
      if(achieved !== undefined) {
        conditions.push("achieved = @achieved")
        params.push({ name: "achieved", type: TYPES.Bit, value: achieved })
      }
      if(expired !== undefined) {
        conditions.push("expired = @expired")
        params.push({ name: "expired", type: TYPES.Bit, value: expired })
      }
      if(projectType !== undefined) {
        conditions.push("projectType = @projectType")
        params.push({ name: "projectType", type: TYPES.VarChar, value: projectType })
      }

      const whereClause = conditions.length > 0 ? `WHERE ${ conditions.join(" AND ") }` : ""

      const countResult = await executeQuery(`${ MILESTONES_DUE_CTE } SELECT COUNT(*) AS total FROM milestones_due ${ whereClause }`, params)
      const total = countResult.rows[0]?.total ?? 0

      const rowsResult = await executeQuery(
        `${ MILESTONES_DUE_CTE } SELECT * FROM milestones_due ${ whereClause } ORDER BY effectiveDate OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [...params, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )

      return { content: [{ type: "text" as const, text: JSON.stringify(paginate(rowsResult.rows, total, offset, limit), null, 2) }] }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error listing milestones: ${ describeError(error) }` }] }
    }
  }) as any,
}
