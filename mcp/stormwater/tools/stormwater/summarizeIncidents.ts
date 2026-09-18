import { executeQuery } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { buildClosedSiteDateFilter } from "../../utils/filters"
import { z } from "zod"

const countFor = async (table: string, siteId?: string, dateFrom?: string, dateTo?: string): Promise<number> => {
  const { conditions, params } = buildClosedSiteDateFilter({ siteId, dateFrom, dateTo })
  const whereClause = conditions.length > 0 ? `WHERE ${ conditions.join(" AND ") }` : ""
  const result = await executeQuery(`SELECT COUNT(*) AS total FROM ${ table } ${ whereClause }`, params)
  return result.rows[0]?.total ?? 0
}

export const summarizeIncidentsTool = {
  name: "stormwater_summarize_incidents",
  description: "Get counts of violations, complaints, and illicit discharges for a date range in one call, instead of calling each list tool separately just to total them up.",
  inputSchema: z.object({
    siteId: z.string().optional().describe("Only incidents for this site (matches sites.siteId, not uuid)"),
    dateFrom: z.string().optional().describe("Only incidents on/after this date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("Only incidents on/before this date (YYYY-MM-DD)"),
  }),
  handler: (async ({ siteId, dateFrom, dateTo }: { siteId?: string; dateFrom?: string; dateTo?: string }) => {
    try {
      // Sequential, not Promise.all -- see connection.ts's requestQueues comment;
      // executeQuery already serializes these, but awaiting one at a time here
      // keeps this tool's control flow obvious without relying on that queue.
      const violations = await countFor("violations", siteId, dateFrom, dateTo)
      const complaints = await countFor("complaints", siteId, dateFrom, dateTo)
      const illicitDischarges = await countFor("illicit_discharges", siteId, dateFrom, dateTo)

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ violations, complaints, illicitDischarges }, null, 2),
        }],
      }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error summarizing incidents: ${ describeError(error) }` }] }
    }
  }) as any,
}
