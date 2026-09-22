import { TYPES } from "tedious"
import { QueryParam } from "../tools/mssql/connection"

// `new Date("YYYY-MM-DD")` parses as UTC midnight, but connection.ts sets
// useUTC:false, so tedious serializes it using LOCAL getters -- on a
// non-UTC server tz (America/Chicago) that silently shifts the date back
// a day (e.g. "2025-07-01" -> Jun 30). Parsing the components directly into
// a local Date sidesteps the UTC/local mismatch entirely.
export const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

// The inverse mistake of the one above: `date.toISOString()` always converts
// to UTC first, which on a non-UTC server tz (America/Chicago) can report
// tomorrow's date for several hours every evening (e.g. 8pm CDT is already
// past midnight UTC). Use this instead of toISOString().slice(0, 10)
// anywhere "today" (or any other Date instance) needs to be read back as the
// server's actual local calendar date -- e.g. agentLoop.ts's system prompt.
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${ year }-${ month }-${ day }`
}

// City of Franklin's fiscal year runs July 1 through June 30, named for the
// calendar year it ENDS in -- fiscalYear "2025" means 2024-07-01..2025-06-30.
export const resolveDateRange = ({ fiscalYear, dateFrom, dateTo }: {
  fiscalYear?: string
  dateFrom?: string
  dateTo?: string
}): { dateFrom?: string; dateTo?: string } => {
  if(fiscalYear === undefined) {
    return { dateFrom, dateTo }
  }

  const match = fiscalYear.match(/(\d{4})/)
  if(!match) {
    throw new Error(`Invalid fiscalYear "${ fiscalYear }" -- expected a 4-digit year, e.g. "2025"`)
  }

  const year = Number(match[1])
  return { dateFrom: `${ year - 1 }-07-01`, dateTo: `${ year }-06-30` }
}

export interface ClosedSiteDateFilters {
  siteId?: string
  inspectorSlug?: string
  closed?: boolean
  fiscalYear?: string
  dateFrom?: string
  dateTo?: string
}

// Shared by the violations/complaints/illicit-discharges list tools (and the
// incident/trend/activity summary tools), which all filter on the same
// siteId/inspectorSlug/closed/date shape against their respective view.
// inspectorSlug resolves via a subquery rather than a join because
// violations/complaints/illicit_discharges already denormalize inspectorId
// directly -- no join to sites needed here, unlike logs/inspections, which
// has no inspector column at all and must join through sites instead.
export const buildClosedSiteDateFilter = ({ siteId, inspectorSlug, closed, fiscalYear, dateFrom, dateTo }: ClosedSiteDateFilters): { conditions: string[]; params: QueryParam[] } => {
  ({ dateFrom, dateTo } = resolveDateRange({ fiscalYear, dateFrom, dateTo }))

  const conditions: string[] = []
  const params: QueryParam[] = []

  if(siteId !== undefined) {
    conditions.push("siteId = @siteId")
    params.push({ name: "siteId", type: TYPES.VarChar, value: siteId })
  }
  if(inspectorSlug !== undefined) {
    conditions.push("inspectorId = (SELECT inspectorId FROM inspectors WHERE slug = @inspectorSlug)")
    params.push({ name: "inspectorSlug", type: TYPES.VarChar, value: inspectorSlug })
  }
  if(closed !== undefined) {
    conditions.push("closed = @closed")
    params.push({ name: "closed", type: TYPES.Bit, value: closed })
  }
  if(dateFrom !== undefined) {
    conditions.push("date >= @dateFrom")
    params.push({ name: "dateFrom", type: TYPES.Date, value: parseLocalDate(dateFrom) })
  }
  if(dateTo !== undefined) {
    conditions.push("date <= @dateTo")
    params.push({ name: "dateTo", type: TYPES.Date, value: parseLocalDate(dateTo) })
  }

  return { conditions, params }
}
