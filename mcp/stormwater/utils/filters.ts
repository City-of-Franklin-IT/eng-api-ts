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

export interface ClosedSiteDateFilters {
  siteId?: string
  closed?: boolean
  dateFrom?: string
  dateTo?: string
}

// Shared by the violations/complaints/illicit-discharges list tools, which all
// filter on the same siteId/closed/date shape against their respective view.
export const buildClosedSiteDateFilter = ({ siteId, closed, dateFrom, dateTo }: ClosedSiteDateFilters): { conditions: string[]; params: QueryParam[] } => {
  const conditions: string[] = []
  const params: QueryParam[] = []

  if(siteId !== undefined) {
    conditions.push("siteId = @siteId")
    params.push({ name: "siteId", type: TYPES.VarChar, value: siteId })
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
