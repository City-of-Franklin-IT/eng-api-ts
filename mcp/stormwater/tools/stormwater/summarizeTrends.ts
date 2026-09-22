import { TYPES } from "tedious"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { buildClosedSiteDateFilter, parseLocalDate, resolveDateRange } from "../../utils/filters"
import { z } from "zod"

// "yyyy-MM" for every calendar month from dateFrom through dateTo, inclusive,
// so a month with zero activity still shows up as 0 rather than being
// silently missing from the trend.
const monthBuckets = (dateFrom: string, dateTo: string): string[] => {
  const from = parseLocalDate(dateFrom)
  const to = parseLocalDate(dateTo)
  const buckets: string[] = []

  const cursor = new Date(from.getFullYear(), from.getMonth(), 1)
  while(cursor <= to) {
    buckets.push(`${ cursor.getFullYear() }-${ String(cursor.getMonth() + 1).padStart(2, "0") }`)
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return buckets
}

const countsByMonth = async (
  fromClause: string,
  dateCol: string,
  conditions: string[],
  params: QueryParam[]
): Promise<Map<string, number>> => {
  const whereClause = conditions.length > 0 ? `WHERE ${ conditions.join(" AND ") }` : ""
  const result = await executeQuery(
    `SELECT CONVERT(char(7), ${ dateCol }, 120) AS period, COUNT(*) AS total
     FROM ${ fromClause } ${ whereClause }
     GROUP BY CONVERT(char(7), ${ dateCol }, 120)`,
    params
  )

  const map = new Map<string, number>()
  for(const row of result.rows) {
    map.set(row.period, row.total)
  }
  return map
}

export const summarizeTrendsTool = {
  name: "stormwater_summarize_trends",
  description: "Get monthly counts of violations, complaints, illicit discharges, and inspections across a date range in one call -- use this for \"how has X changed over time\" instead of calling the list/summarize tools once per period yourself. Every month in the range is included even if its count is 0. Requires either fiscalYear or both dateFrom and dateTo.",
  inputSchema: z.object({
    fiscalYear: z.string().optional().describe("Trend for this fiscal year, e.g. \"2025\" for 2024-07-01 through 2025-06-30. Takes precedence over dateFrom/dateTo if both given. Required if dateFrom/dateTo are omitted."),
    dateFrom: z.string().optional().describe("Start of the range, inclusive (YYYY-MM-DD). Required if fiscalYear is omitted."),
    dateTo: z.string().optional().describe("End of the range, inclusive (YYYY-MM-DD). Required if fiscalYear is omitted."),
    siteId: z.string().optional().describe("Only trends for this site (matches sites.siteId, not uuid)"),
    inspectorSlug: z.string().optional().describe("Only trends for this inspector (matches inspectors.slug)"),
  }),
  handler: (async ({ fiscalYear, dateFrom, dateTo, siteId, inspectorSlug }: {
    fiscalYear?: string
    dateFrom?: string
    dateTo?: string
    siteId?: string
    inspectorSlug?: string
  }) => {
    try {
      ({ dateFrom, dateTo } = resolveDateRange({ fiscalYear, dateFrom, dateTo }))

      if(dateFrom === undefined || dateTo === undefined) {
        return { content: [{ type: "text" as const, text: "Error summarizing trends: provide either fiscalYear, or both dateFrom and dateTo" }] }
      }

      const { conditions, params } = buildClosedSiteDateFilter({ siteId, inspectorSlug, dateFrom, dateTo })

      // Sequential, not Promise.all -- see connection.ts's requestQueues comment;
      // executeQuery already serializes these, but awaiting one at a time here
      // keeps this tool's control flow obvious without relying on that queue.
      const violations = await countsByMonth("violations", "date", conditions, params)
      const complaints = await countsByMonth("complaints", "date", conditions, params)
      const illicitDischarges = await countsByMonth("illicit_discharges", "date", conditions, params)

      // logs has no inspector column -- join through sites.inspectorSlug (safe,
      // since a site keeps the same assigned inspector for its whole lifespan).
      const inspectionFrom = inspectorSlug !== undefined ? "logs l JOIN sites s ON l.siteId = s.siteId" : "logs"
      const inspectionDateCol = inspectorSlug !== undefined ? "l.inspectionDate" : "inspectionDate"
      const inspectionConditions: string[] = []
      const inspectionParams: QueryParam[] = []

      if(siteId !== undefined) {
        inspectionConditions.push(`${ inspectorSlug !== undefined ? "l.siteId" : "siteId" } = @siteId`)
        inspectionParams.push({ name: "siteId", type: TYPES.VarChar, value: siteId })
      }
      if(inspectorSlug !== undefined) {
        inspectionConditions.push("s.inspectorSlug = @inspectorSlug")
        inspectionParams.push({ name: "inspectorSlug", type: TYPES.VarChar, value: inspectorSlug })
      }
      inspectionConditions.push(`${ inspectionDateCol } >= @dateFrom`)
      inspectionParams.push({ name: "dateFrom", type: TYPES.Date, value: parseLocalDate(dateFrom) })
      inspectionConditions.push(`${ inspectionDateCol } <= @dateTo`)
      inspectionParams.push({ name: "dateTo", type: TYPES.Date, value: parseLocalDate(dateTo) })

      const inspections = await countsByMonth(inspectionFrom, inspectionDateCol, inspectionConditions, inspectionParams)

      const trend = monthBuckets(dateFrom, dateTo).map((period) => ({
        period,
        violations: violations.get(period) ?? 0,
        complaints: complaints.get(period) ?? 0,
        illicitDischarges: illicitDischarges.get(period) ?? 0,
        inspections: inspections.get(period) ?? 0,
      }))

      return { content: [{ type: "text" as const, text: JSON.stringify({ trend }, null, 2) }] }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error summarizing trends: ${ describeError(error) }` }] }
    }
  }) as any,
}
