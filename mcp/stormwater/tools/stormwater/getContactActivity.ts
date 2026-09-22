import { TYPES } from "tedious"
import { executeQuery, QueryParam } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { parseLocalDate, resolveDateRange } from "../../utils/filters"
import { z } from "zod"

const countFor = async (table: string, contactId: string, dateFrom?: string, dateTo?: string): Promise<number> => {
  const conditions: string[] = ["siteId IN (SELECT siteId FROM site_contacts WHERE contactId = @contactId)"]
  const params: QueryParam[] = [{ name: "contactId", type: TYPES.VarChar, value: contactId }]

  if(dateFrom !== undefined) {
    conditions.push("date >= @dateFrom")
    params.push({ name: "dateFrom", type: TYPES.Date, value: parseLocalDate(dateFrom) })
  }
  if(dateTo !== undefined) {
    conditions.push("date <= @dateTo")
    params.push({ name: "dateTo", type: TYPES.Date, value: parseLocalDate(dateTo) })
  }

  const result = await executeQuery(`SELECT COUNT(*) AS total FROM ${ table } WHERE ${ conditions.join(" AND ") }`, params)
  return result.rows[0]?.total ?? 0
}

export const getContactActivityTool = {
  name: "stormwater_get_contact_activity",
  description: "Get a contact's enforcement history over a date range in one call: counts of violations, complaints, and illicit discharges across every site that contact is associated with (as primary contact, contractor, and/or inspector). Use stormwater_list_contacts first to resolve a name to a contactId.",
  inputSchema: z.object({
    contactId: z.string().describe("The contact's contactId, as returned by stormwater_list_contacts"),
    fiscalYear: z.string().optional().describe("Only activity in this fiscal year, e.g. \"2025\" for 2024-07-01 through 2025-06-30. Takes precedence over dateFrom/dateTo if both given."),
    dateFrom: z.string().optional().describe("Only activity on/after this date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("Only activity on/before this date (YYYY-MM-DD)"),
  }),
  handler: (async ({ contactId, fiscalYear, dateFrom, dateTo }: { contactId: string; fiscalYear?: string; dateFrom?: string; dateTo?: string }) => {
    try {
      ({ dateFrom, dateTo } = resolveDateRange({ fiscalYear, dateFrom, dateTo }))

      const contactResult = await executeQuery(
        "SELECT * FROM contacts WHERE contactId = @contactId",
        [{ name: "contactId", type: TYPES.VarChar, value: contactId }]
      )
      const contact = contactResult.rows[0]

      if(!contact) {
        return { content: [{ type: "text" as const, text: `No contact found with contactId ${ contactId }` }] }
      }

      const violations = await countFor("violations", contactId, dateFrom, dateTo)
      const complaints = await countFor("complaints", contactId, dateFrom, dateTo)
      const illicitDischarges = await countFor("illicit_discharges", contactId, dateFrom, dateTo)

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            contact,
            dateFrom: dateFrom ?? null,
            dateTo: dateTo ?? null,
            violations,
            complaints,
            illicitDischarges,
          }, null, 2),
        }],
      }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error getting contact activity: ${ describeError(error) }` }] }
    }
  }) as any,
}
