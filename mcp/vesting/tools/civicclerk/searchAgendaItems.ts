// Ported from finance-mcp-server-ts's tools/civicclerk/searchAgendaItems.ts, adapted to this
// server's conventions: inputSchema wrapped in z.object() (matches tools/vesting/*.ts and what
// utils/anthropicTools.ts's z.toJSONSchema() expects) and describeError() in the catch block.
import { z } from "zod"
import { fetchAllMeetings } from "./dateChunking"
import { searchItems } from "./agendaUtils"
import { searchResultsCache, createSearchCacheKey } from "./cache"
import { describeError } from "../../utils/errors"

const DAY_MS = 24 * 60 * 60 * 1000
const SPARSE_DATA_WARNING_DAYS = 2 * 365
const MAX_SEARCH_RESULTS = 100

export const searchAgendaItemsTool = {
  name: "civicclerk_search_agenda_items",
  description:
    `Search agenda item text (names and descriptions) across CivicClerk (Franklin TN) meetings within a date range, and return only the matching items -- not full agenda trees.

HOW IT WORKS:
- Fetches all meetings in date range (chunked internally into 90-day windows)
- Searches item names/descriptions for your query terms
- Returns paginated results with metadata on total matches available

PAGINATION:
- Default: returns first 10 matching items
- Use limit parameter (max 100) to change page size
- Use offset parameter to get subsequent pages
- Response includes totalMatches and hasMore flag
- Example: offset: 10, limit: 10 returns items 11-20

RESULTS ARE LEAN:
- Descriptions truncated to 150 chars
- Attachment ids/names only (no SAS download links)
- For full agenda trees with attachment URLs, use civicclerk_get_meetings with includeItems: true

WHEN TO USE THIS:
- "Has topic X been discussed in meetings?" (searching across committees)
- Scanning agenda item text for keywords
- Multi-meeting searches
- For a vesting project specifically, prefer vesting_search_project_meetings, which builds the
  query from a project record and scopes to the Franklin Municipal Planning Commission (FMPC) /
  Board of Mayor and Aldermen (BOMA) meetings vesting projects actually land on.

WHEN NOT TO USE THIS:
- You have a specific meeting ID -> use civicclerk_get_meetings with includeItems: true
- You want to list/browse meetings (e.g. "what's on next week's BOMA agenda") -> use civicclerk_get_meetings

DATA COVERAGE:
Older meetings may lack agenda item data. The response includes a coverage summary showing how many scanned meetings had agenda data available.`,
  inputSchema: z.object({
    query: z.string().describe("Keyword or phrase to search for. All whitespace-separated terms must match (case-insensitive) against the item name or description."),
    startDate: z.string().describe("Start date in ISO 8601 format (e.g., 2023-01-01). No range limit -- wide ranges are supported and handled internally."),
    endDate: z.string().describe("End date in ISO 8601 format (e.g., 2025-01-31)."),
    nameFilter: z.string().optional().describe("Case-insensitive substring filter on meeting/committee name (e.g. 'Planning Commission'), applied before scanning items to narrow scope."),
    limit: z.number().optional().describe("Maximum number of matching items to return per page (default: 10, max: 100). Attachments are returned as id/name only (no download links) to keep results lean."),
    offset: z.number().optional().describe("Number of items to skip for pagination (default: 0). Use this with hasMore/nextOffset from previous response to get next page."),
  }),
  handler: (
    async ({
      query,
      startDate,
      endDate,
      nameFilter,
      limit = 10,
      offset = 0,
    }: {
      query: string
      startDate: string
      endDate: string
      nameFilter?: string
      limit?: number
      offset?: number
    }) => {
      try {
        const cacheKey = createSearchCacheKey(query, startDate, endDate, nameFilter)
        const cached: { matches: any[]; meetingsScanned: number; meetingsWithAgendaData: number } | null =
          searchResultsCache.get(cacheKey)
        let allMatches: any[]
        let meetingsScanned: number
        let meetingsWithAgendaData: number
        let fromCache = true

        if(!cached) {
          fromCache = false
          const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
          const { meetings } = await fetchAllMeetings(startDate, endDate)

          let scoped = meetings
          if(nameFilter) {
            const lower = nameFilter.toLowerCase()
            scoped = scoped.filter((m: any) => m.name?.toLowerCase().includes(lower))
          }

          meetingsScanned = scoped.length
          meetingsWithAgendaData = 0
          allMatches = []

          for(const meeting of scoped) {
            const items = meeting.items || []
            if(items.length > 0) meetingsWithAgendaData++

            const meetingMatches: any[] = []
            searchItems(items, terms, meetingMatches)

            for(const item of meetingMatches) {
              allMatches.push({
                meetingId: meeting.id,
                meetingName: meeting.name,
                meetingDate: meeting.meetingDate,
                item,
              })
            }
          }

          searchResultsCache.set(cacheKey, { matches: allMatches, meetingsScanned, meetingsWithAgendaData })
        } else {
          allMatches = cached.matches
          meetingsScanned = cached.meetingsScanned
          meetingsWithAgendaData = cached.meetingsWithAgendaData
        }

        const totalMatches = allMatches.length
        const enforcedLimit = Math.min(limit ?? 10, MAX_SEARCH_RESULTS)
        const paginatedMatches = allMatches.slice(offset, offset + enforcedLimit)

        const rangeDays = Math.round(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / DAY_MS
        )

        const result: Record<string, any> = {
          data: paginatedMatches,
          pagination: {
            offset,
            limit: enforcedLimit,
            totalMatches,
            returned: paginatedMatches.length,
            hasMore: totalMatches > offset + enforcedLimit,
            ...(totalMatches > offset + enforcedLimit && { nextOffset: offset + enforcedLimit }),
          },
          coverage: {
            meetingsScanned,
            meetingsWithAgendaData,
            meetingsWithoutAgendaData: meetingsScanned - meetingsWithAgendaData,
          },
        }

        if(fromCache) {
          result.cache = "HIT"
        }

        if(rangeDays > SPARSE_DATA_WARNING_DAYS) {
          result.note =
            "This date range spans more than 2 years. Agenda item data becomes sparser for older meetings, so results may be incomplete for older records -- check the coverage summary."
        }

        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        }
      } catch(error) {
        return {
          content: [{ type: "text" as const, text: `Error searching agenda items: ${ describeError(error) }` }],
        }
      }
    }
  ) as any,
}
