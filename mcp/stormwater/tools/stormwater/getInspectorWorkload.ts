import { TYPES } from "tedious"
import { executeQuery } from "../mssql/connection"
import { describeError } from "../../utils/errors"
import { paginate } from "../../utils/pagination"
import { z } from "zod"

export const getInspectorWorkloadTool = {
  name: "stormwater_get_inspector_workload",
  description: "Get an inspector's current workload: all sites assigned to them, each with its open-violation/complaint/illicit-discharge status flags. Supports pagination.",
  inputSchema: z.object({
    slug: z.string().describe("The inspector's slug, as returned by stormwater_list_inspectors"),
    limit: z.number().int().min(1).max(100).optional().describe("Max sites to return (default 50, max 100)"),
    offset: z.number().int().min(0).optional().describe("Sites to skip (default 0)"),
  }),
  handler: (async ({ slug, limit = 50, offset = 0 }: { slug: string; limit?: number; offset?: number }) => {
    try {
      const inspectorResult = await executeQuery(
        "SELECT * FROM inspectors WHERE slug = @slug",
        [{ name: "slug", type: TYPES.VarChar, value: slug }]
      )
      const inspector = inspectorResult.rows[0]

      if(!inspector) {
        return { content: [{ type: "text" as const, text: `No inspector found with slug ${ slug }` }] }
      }

      const inspectorIdParam = { name: "inspectorId", type: TYPES.VarChar, value: inspector.inspectorId }

      const countResult = await executeQuery("SELECT COUNT(*) AS total FROM sites WHERE inspectorId = @inspectorId", [inspectorIdParam])
      const total = countResult.rows[0]?.total ?? 0

      // Slim, status-rollup field set -- matches what the tool's description
      // promises (open-status flags per site), not the full ~20-column sites
      // row. A busy inspector's full site list otherwise blows past the
      // client's token cap (see listActiveSites.ts for the same rationale).
      const sitesResult = await executeQuery(
        `SELECT uuid, siteId, name, permit, cof, hasOpenViolation, hasOpenComplaint, hasOpenIllicitDischarge, isActive
         FROM sites WHERE inspectorId = @inspectorId
         ORDER BY name OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        [inspectorIdParam, { name: "offset", type: TYPES.Int, value: offset }, { name: "limit", type: TYPES.Int, value: limit }]
      )

      const { data: sites, pagination } = paginate(sitesResult.rows, total, offset, limit)

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ inspector, sites, pagination }, null, 2),
        }],
      }
    } catch (error) {
      return { content: [{ type: "text" as const, text: `Error getting inspector workload: ${ describeError(error) }` }] }
    }
  }) as any,
}
