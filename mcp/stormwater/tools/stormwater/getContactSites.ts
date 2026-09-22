import { TYPES } from "tedious"
import { executeQuery } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { z } from "zod"

export const getContactSitesTool = {
  name: "stormwater_get_contact_sites",
  description: "Get all sites a contact is associated with (as primary contact, contractor, and/or inspector), including each site's open-status flags. Use stormwater_list_contacts first to resolve a name to a contactId.",
  inputSchema: z.object({
    contactId: z.string().describe("The contact's contactId, as returned by stormwater_list_contacts"),
    limit: z.number().int().min(1).max(100).optional().describe("Max sites to return (default 50, max 100)"),
    offset: z.number().int().min(0).optional().describe("Sites to skip (default 0)"),
  }),
  handler: (async ({ contactId, limit = 50, offset = 0 }: { contactId: string; limit?: number; offset?: number }) => {
    try {
      const contactResult = await executeQuery(
        "SELECT * FROM contacts WHERE contactId = @contactId",
        [{ name: "contactId", type: TYPES.VarChar, value: contactId }]
      )
      const contact = contactResult.rows[0]

      if(!contact) {
        return { content: [{ type: "text" as const, text: `No contact found with contactId ${ contactId }` }] }
      }

      const contactIdParam = { name: "contactId", type: TYPES.VarChar, value: contactId }

      const countResult = await executeQuery(
        "SELECT COUNT(*) AS total FROM site_contacts WHERE contactId = @contactId",
        [contactIdParam]
      )
      const total = countResult.rows[0]?.total ?? 0

      const sitesResult = await executeQuery(
        `SELECT sc.siteId, sc.siteName, sc.isPrimary, sc.isContractor, sc.isInspector,
                s.inspectorName, s.hasOpenViolation, s.hasOpenComplaint, s.hasOpenIllicitDischarge, s.isActive
         FROM site_contacts sc JOIN sites s ON sc.siteId = s.siteId
         WHERE sc.contactId = @contactId
         ORDER BY sc.siteName OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [contactIdParam, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )

      const { data: sites, pagination } = paginate(sitesResult.rows, total, offset, limit)

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ contact, sites, pagination }, null, 2),
        }],
      }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error getting contact sites: ${ describeError(error) }` }] }
    }
  }) as any,
}
