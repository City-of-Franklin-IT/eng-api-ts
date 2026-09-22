import { TYPES } from "tedious"
import { executeQuery } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { z } from "zod"

export const getProjectTool = {
  name: "vesting_get_project",
  description: "Get full detail for a single vesting project by uuid, including its milestones (with extension date, effective/extension-aware due date, and achieved/expired status), vesting periods (10Y/15Y, same effective-date treatment), approvals, resolution, and vesting notifications.",
  inputSchema: z.object({
    uuid: z.string().describe("The project's uuid, as returned by vesting_list_projects"),
  }),
  handler: (async ({ uuid }: { uuid: string }) => {
    try {
      const projectResult = await executeQuery(
        "SELECT * FROM project WHERE uuid = @uuid",
        [{ name: "uuid", type: TYPES.UniqueIdentifier, value: uuid }]
      )
      const project = projectResult.rows[0]

      if(!project) {
        return { content: [{ type: "text" as const, text: `No project found with uuid ${ uuid }` }] }
      }

      const projectUuidParam = { name: "projectUuid", type: TYPES.UniqueIdentifier, value: uuid }

      // Sequential, not Promise.all: tedious's Connection handles one in-flight
      // request at a time, and connection.ts caches a single Connection per
      // server key (not a real pool) -- concurrent execSql calls on it throw
      // "Requests can only be made in the LoggedIn state, not ... state".
      //
      // milestone.parentId / vesting_period.parentId store the PROJECT's uuid
      // directly (see Sequelize associations: belongsTo(Project, { targetKey:
      // 'uuid', foreignKey: 'parentId' })) -- no join to an internal numeric id
      // is needed. extension.parentId / vesting_extension.parentId /
      // milestone_status.parentId / vesting_status.parentId instead point at
      // the MILESTONE's or VESTING PERIOD's uuid, one level down.
      const milestones = await executeQuery(
        `SELECT
           m.uuid, m.number, m.date, m.createdAt, m.updatedAt,
           e.date AS extensionDate,
           COALESCE(e.date, m.date) AS effectiveDate,
           ms.achieved, ms.expired
         FROM milestone m
         LEFT JOIN extension e ON e.parentId = m.uuid
         LEFT JOIN milestone_status ms ON ms.parentId = m.uuid
         WHERE m.parentId = @projectUuid
         ORDER BY m.number`,
        [projectUuidParam]
      )
      const vestingPeriods = await executeQuery(
        `SELECT
           vp.uuid, vp.type, vp.date, vp.createdAt, vp.updatedAt,
           ve.date AS extensionDate,
           COALESCE(ve.date, vp.date) AS effectiveDate,
           vs.achieved, vs.expired
         FROM vesting_period vp
         LEFT JOIN vesting_extension ve ON ve.parentId = vp.uuid
         LEFT JOIN vesting_status vs ON vs.parentId = vp.uuid
         WHERE vp.parentId = @projectUuid
         ORDER BY vp.type`,
        [projectUuidParam]
      )
      const approvals = await executeQuery("SELECT * FROM approval WHERE parentId = @projectUuid ORDER BY date", [projectUuidParam])
      const resolution = await executeQuery("SELECT * FROM resolution WHERE parentId = @projectUuid", [projectUuidParam])
      const notifications = await executeQuery("SELECT * FROM notification WHERE parentId = @projectUuid ORDER BY date DESC", [projectUuidParam])

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            ...project,
            milestones: milestones.rows,
            vestingPeriods: vestingPeriods.rows,
            approvals: approvals.rows,
            resolution: resolution.rows[0] ?? null,
            notifications: notifications.rows,
          }, null, 2),
        }],
      }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error getting project: ${ describeError(error) }` }] }
    }
  }) as any,
}
