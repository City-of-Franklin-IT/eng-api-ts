import { TYPES } from "tedious"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { parseLocalDate } from "../../utils/filters"
import { z } from "zod"

// Same shape as listMilestonesDue.ts's CTE, one level up: vesting_period.parentId
// stores the PROJECT's uuid directly, vesting_extension.parentId / vesting_status.parentId
// store the VESTING PERIOD's uuid. effectiveDate = vesting_extension.date if present,
// else vesting_period.date -- mirrors project-vesting-vite-ts's client-side override.
const VESTING_PERIODS_CTE = `
  WITH vesting_periods_due AS (
    SELECT
      vp.uuid, vp.type, vp.date, vp.parentId AS projectUuid, vp.createdAt, vp.updatedAt,
      ve.date AS extensionDate,
      COALESCE(ve.date, vp.date) AS effectiveDate,
      vs.achieved, vs.expired,
      p.type AS projectType, p.name AS projectName
    FROM vesting_period vp
    LEFT JOIN vesting_extension ve ON ve.parentId = vp.uuid
    LEFT JOIN vesting_status vs ON vs.parentId = vp.uuid
    JOIN project p ON p.uuid = vp.parentId
  )
`

export const listVestingPeriodsTool = {
  name: "vesting_list_vesting_periods",
  description: "List vesting periods (10Y / 15Y) by their EFFECTIVE date -- a vesting extension's date if one exists, otherwise the period's own date. Use this, not vesting_list_milestones_due, for the 10-year/15-year vesting expiration dates themselves. Also use this (with extended: true) to answer \"which vesting periods/projects have been extended\". Supports filtering and pagination.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(200).optional().describe("Max rows to return (default 50, max 200)"),
    offset: z.number().int().min(0).optional().describe("Rows to skip (default 0)"),
    projectUuid: z.string().optional().describe("Only periods for this project (matches project.uuid)"),
    type: z.enum(["10Y", "15Y"]).optional().describe("Filter to this vesting period type"),
    dateFrom: z.string().optional().describe("Only periods with effective date on/after this date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("Only periods with effective date on/before this date (YYYY-MM-DD)"),
    achieved: z.boolean().optional().describe("Filter to achieved (true) or not-yet-achieved (false) periods"),
    expired: z.boolean().optional().describe("Filter to expired (true) or not-expired (false) periods"),
    extended: z.boolean().optional().describe("Filter to vesting periods that currently have a recorded extension (true) or don't (false). Use this to answer 'which vesting periods/projects have been extended'."),
    projectType: z.enum(["Development Plan", "Preliminary Plat", "Site Plan"]).optional().describe("Filter to periods on projects of this type"),
  }),
  handler: (async ({ limit = 50, offset = 0, projectUuid, type, dateFrom, dateTo, achieved, expired, extended, projectType }: {
    limit?: number
    offset?: number
    projectUuid?: string
    type?: string
    dateFrom?: string
    dateTo?: string
    achieved?: boolean
    expired?: boolean
    extended?: boolean
    projectType?: string
  }) => {
    try {
      const conditions: string[] = []
      const params: QueryParam[] = []

      if(projectUuid !== undefined) {
        conditions.push("projectUuid = @projectUuid")
        params.push({ name: "projectUuid", type: TYPES.UniqueIdentifier, value: projectUuid })
      }
      if(type !== undefined) {
        conditions.push("type = @type")
        params.push({ name: "type", type: TYPES.VarChar, value: type })
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
      if(extended !== undefined) {
        conditions.push(extended ? "extensionDate IS NOT NULL" : "extensionDate IS NULL")
      }
      if(projectType !== undefined) {
        conditions.push("projectType = @projectType")
        params.push({ name: "projectType", type: TYPES.VarChar, value: projectType })
      }

      const whereClause = conditions.length > 0 ? `WHERE ${ conditions.join(" AND ") }` : ""

      const countResult = await executeQuery(`${ VESTING_PERIODS_CTE } SELECT COUNT(*) AS total FROM vesting_periods_due ${ whereClause }`, params)
      const total = countResult.rows[0]?.total ?? 0

      const rowsResult = await executeQuery(
        `${ VESTING_PERIODS_CTE } SELECT * FROM vesting_periods_due ${ whereClause } ORDER BY effectiveDate OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [...params, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )

      return { content: [{ type: "text" as const, text: JSON.stringify(paginate(rowsResult.rows, total, offset, limit), null, 2) }] }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error listing vesting periods: ${ describeError(error) }` }] }
    }
  }) as any,
}
