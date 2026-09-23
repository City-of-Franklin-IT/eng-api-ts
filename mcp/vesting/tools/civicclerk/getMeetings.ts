// Ported from finance-mcp-server-ts's tools/civicclerk/getMeetings.ts, adapted to this server's
// conventions (z.object() inputSchema, describeError()).
import { z } from "zod"
import { fetchAllMeetings } from "./dateChunking"
import { filterMeetingResponse, filterMeetingResponseSlim } from "./filterFields"
import { describeError } from "../../utils/errors"

const MAX_MEETING_LIST_RESULTS = 200

export const getMeetingsTool = {
  name: "civicclerk_get_meetings",
  description: `Fetch city council meetings from CivicClerk (Franklin TN).

USAGE PATTERN:
1. List meetings: query with date range, optional nameFilter (e.g., 'Planning Commission')
   - Returns slim results (id, name, meetingDate) for easy browsing
   - Supports pagination with offset/limit
2. Get full agenda: once you have a specific meeting id AND its meetingDate, set includeItems: true
   - Requires: id parameter
   - Returns: full agenda items tree with descriptions and attachments
   - IMPORTANT FOR SPEED: this still fetches every meeting in startDate/endDate before filtering
     down to id -- there is no cheaper single-meeting lookup. Once you know the meeting's
     meetingDate (from step 1, or from civicclerk_get_latest_meeting), pass a TIGHT range for
     this call (that exact date, or +/- 1 day) instead of reusing whatever wide range you used
     to find it -- reusing a multi-month/year range here re-fetches everything in it just to
     throw away all but one meeting, and is the main cause of this call being slow.

PAGINATION:
- For meeting lists: use offset/limit to paginate through results
- Max results per page: 200
- Response includes totalMatches and hasMore flag
- Example: offset: 25, limit: 25 returns meetings 26-50

IMPORTANT: includeItems: true REQUIRES an id parameter. Never use includeItems: true without specifying a meeting id.

TIPS:
- Searching for a specific topic/keyword across multiple meetings? Use civicclerk_search_agenda_items instead
- Looking for a vesting project specifically? vesting_search_project_meetings scopes this same data to FMPC/BOMA automatically
- Looking for the MOST RECENT meeting of a committee ("when was the last FMPC meeting")? Use civicclerk_get_latest_meeting instead of guessing a date range here -- guessing wrong either misses it or risks a slow multi-year fetch

COST: Fetches all meetings in date range on first call (chunked internally).`,
  inputSchema: z.object({
    startDate: z.string().describe("Start date in ISO 8601 format (e.g., 2025-01-01). When id is already known, use a tight range around its meetingDate (not a wide search range) -- see IMPORTANT FOR SPEED above."),
    endDate: z.string().describe("End date in ISO 8601 format (e.g., 2025-01-31). Same tight-range guidance as startDate applies when id is set."),
    id: z.number().optional().describe("Specific meeting ID to fetch. REQUIRED if includeItems is true."),
    includeItems: z.boolean().optional().describe("Include full agenda items tree (default: false). REQUIRES id parameter. Only use after you have identified a specific meeting."),
    includeAttachments: z.boolean().optional().describe("Include attachment and file lists (default: false). Only applies when includeItems is true."),
    nameFilter: z.string().optional().describe("Case-insensitive substring filter applied to meeting name. Use this to find a specific committee or meeting type (e.g., 'Planning Commission'). Returns slim results (no agenda items)."),
    limit: z.number().optional().describe("Maximum number of meetings to return per page (default: 25, max: 200). Only applies when listing (id and includeItems not specified)."),
    offset: z.number().optional().describe("Number of meetings to skip for pagination (default: 0). Use with hasMore/nextOffset from previous response to get next page."),
  }),
  handler: (
    async ({
      startDate,
      endDate,
      id,
      includeItems = false,
      includeAttachments = false,
      nameFilter,
      limit = 25,
      offset = 0,
    }: {
      startDate: string
      endDate: string
      id?: number
      includeItems?: boolean
      includeAttachments?: boolean
      nameFilter?: string
      limit?: number
      offset?: number
    }) => {
      try {
        if(includeItems && id === undefined) {
          return {
            content: [{ type: "text" as const, text: "Error: includeItems requires a specific meeting id. First query with includeItems: false to find the meeting, then call again with the meeting id and includeItems: true." }],
          }
        }

        const { meetings: fetchedMeetings } = await fetchAllMeetings(startDate, endDate)
        let meetings = fetchedMeetings

        if(id !== undefined) {
          meetings = meetings.filter((meeting: any) => meeting.id === id)
        }

        if(nameFilter) {
          const lower = nameFilter.toLowerCase()
          meetings = meetings.filter((m: any) =>
            m.name?.toLowerCase().includes(lower)
          )
        }

        const total = meetings.length
        const enforcedLimit = Math.min(limit, MAX_MEETING_LIST_RESULTS)
        const paginatedMeetings = meetings.slice(offset, offset + enforcedLimit)

        const filteredMeetings = paginatedMeetings.map((meeting: any) =>
          includeItems
            ? filterMeetingResponse(meeting, includeAttachments)
            : filterMeetingResponseSlim(meeting)
        )

        const result: Record<string, any> = {
          data: filteredMeetings,
          pagination: {
            offset,
            limit: enforcedLimit,
            total,
            returned: filteredMeetings.length,
            hasMore: total > offset + enforcedLimit,
            ...(total > offset + enforcedLimit && { nextOffset: offset + enforcedLimit }),
          },
        }

        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        }
      } catch(error) {
        return {
          content: [{ type: "text" as const, text: `Error fetching meetings: ${ describeError(error) }` }],
        }
      }
    }
  ) as any,
}
