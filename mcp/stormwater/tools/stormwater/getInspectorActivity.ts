import { TYPES } from "tedious"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { buildClosedSiteDateFilter, parseLocalDate, resolveDateRange } from "../../utils/filters"
import { z } from "zod"

const countFor = async (table: string, inspectorSlug: string, dateFrom?: string, dateTo?: string): Promise<number> => {
  const { conditions, params } = buildClosedSiteDateFilter({ inspectorSlug, dateFrom, dateTo })
  const whereClause = conditions.length > 0 ? `WHERE ${ conditions.join(" AND ") }` : ""
  const result = await executeQuery(`SELECT COUNT(*) AS total FROM ${ table } ${ whereClause }`, params)
  return result.rows[0]?.total ?? 0
}

export const getInspectorActivityTool = {
  name: "stormwater_get_inspector_activity",
  description: "Get an inspector's activity over a date range in one call: inspections performed (and distinct sites visited), plus violations, complaints, and illicit discharges they logged. Use this instead of chaining stormwater_list_inspections/violations/complaints/illicit_discharges yourself for \"what has this inspector been doing\" style questions.",
  inputSchema: z.object({
    slug: z.string().describe("The inspector's slug, as returned by stormwater_list_inspectors"),
    fiscalYear: z.string().optional().describe("Only activity in this fiscal year, e.g. \"2025\" for 2024-07-01 through 2025-06-30. Takes precedence over dateFrom/dateTo if both given."),
    dateFrom: z.string().optional().describe("Only activity on/after this date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("Only activity on/before this date (YYYY-MM-DD)"),
  }),
  handler: (async ({ slug, fiscalYear, dateFrom, dateTo }: { slug: string; fiscalYear?: string; dateFrom?: string; dateTo?: string }) => {
    try {
      ({ dateFrom, dateTo } = resolveDateRange({ fiscalYear, dateFrom, dateTo }))

      const inspectorResult = await executeQuery(
        "SELECT * FROM inspectors WHERE slug = @slug",
        [{ name: "slug", type: TYPES.VarChar, value: slug }]
      )
      const inspector = inspectorResult.rows[0]

      if(!inspector) {
        return { content: [{ type: "text" as const, text: `No inspector found with slug ${ slug }` }] }
      }

      // logs has no inspector column -- join through sites.inspectorSlug (safe,
      // since a site keeps the same assigned inspector for its whole lifespan).
      const inspectionConditions: string[] = ["s.inspectorSlug = @inspectorSlug"]
      const inspectionParams: QueryParam[] = [{ name: "inspectorSlug", type: TYPES.VarChar, value: slug }]

      if(dateFrom !== undefined) {
        inspectionConditions.push("l.inspectionDate >= @dateFrom")
        inspectionParams.push({ name: "dateFrom", type: TYPES.Date, value: parseLocalDate(dateFrom) })
      }
      if(dateTo !== undefined) {
        inspectionConditions.push("l.inspectionDate <= @dateTo")
        inspectionParams.push({ name: "dateTo", type: TYPES.Date, value: parseLocalDate(dateTo) })
      }

      const inspectionResult = await executeQuery(
        `SELECT COUNT(*) AS total, COUNT(DISTINCT l.siteId) AS distinctSiteCount
         FROM logs l JOIN sites s ON l.siteId = s.siteId
         WHERE ${ inspectionConditions.join(" AND ") }`,
        inspectionParams
      )

      const violations = await countFor("violations", slug, dateFrom, dateTo)
      const complaints = await countFor("complaints", slug, dateFrom, dateTo)
      const illicitDischarges = await countFor("illicit_discharges", slug, dateFrom, dateTo)

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            inspector,
            dateFrom: dateFrom ?? null,
            dateTo: dateTo ?? null,
            inspections: {
              count: inspectionResult.rows[0]?.total ?? 0,
              distinctSitesVisited: inspectionResult.rows[0]?.distinctSiteCount ?? 0,
            },
            violations,
            complaints,
            illicitDischarges,
          }, null, 2),
        }],
      }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error getting inspector activity: ${ describeError(error) }` }] }
    }
  }) as any,
}
