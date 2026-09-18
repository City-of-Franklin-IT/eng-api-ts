import { TYPES } from "tedious"
import { executeQuery } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { z } from "zod"

export const getSiteTool = {
  name: "stormwater_get_site",
  description: "Get full detail for a single stormwater site by uuid, including its violations, complaints, illicit discharges, inspection logs, site contacts, and any follow-up dates tied to those records.",
  inputSchema: z.object({
    uuid: z.string().describe("The site's uuid, as returned by stormwater_list_sites"),
  }),
  handler: (async ({ uuid }: { uuid: string }) => {
    try {
      const siteResult = await executeQuery(
        "SELECT * FROM sites WHERE uuid = @uuid",
        [{ name: "uuid", type: TYPES.UniqueIdentifier, value: uuid }]
      )
      const site = siteResult.rows[0]

      if(!site) {
        return { content: [{ type: "text" as const, text: `No site found with uuid ${ uuid }` }] }
      }

      const siteIdParam = { name: "siteId", type: TYPES.VarChar, value: site.siteId }

      // Sequential, not Promise.all: tedious's Connection handles one in-flight
      // request at a time, and connection.ts caches a single Connection per
      // server key (not a real pool) -- concurrent execSql calls on it throw
      // "Requests can only be made in the LoggedIn state, not ... state".
      const violations = await executeQuery("SELECT * FROM violations WHERE siteId = @siteId ORDER BY date DESC", [siteIdParam])
      const complaints = await executeQuery("SELECT * FROM complaints WHERE siteId = @siteId ORDER BY date DESC", [siteIdParam])
      const illicitDischarges = await executeQuery("SELECT * FROM illicit_discharges WHERE siteId = @siteId ORDER BY date DESC", [siteIdParam])
      const logs = await executeQuery("SELECT * FROM logs WHERE siteId = @siteId ORDER BY inspectionDate DESC", [siteIdParam])
      const siteContacts = await executeQuery("SELECT * FROM site_contacts WHERE siteId = @siteId", [siteIdParam])
      const followUpDates = await executeQuery(
        `SELECT * FROM follow_up_dates
         WHERE violationId IN (SELECT violationId FROM violations WHERE siteId = @siteId)
            OR complaintId IN (SELECT complaintId FROM complaints WHERE siteId = @siteId)
            OR illicitId IN (SELECT illicitId FROM illicit_discharges WHERE siteId = @siteId)
         ORDER BY followUpDate DESC`,
        [siteIdParam]
      )

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            ...site,
            violations: violations.rows,
            complaints: complaints.rows,
            illicitDischarges: illicitDischarges.rows,
            logs: logs.rows,
            siteContacts: siteContacts.rows,
            followUpDates: followUpDates.rows,
          }, null, 2),
        }],
      }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error getting site: ${ describeError(error) }` }] }
    }
  }) as any,
}
