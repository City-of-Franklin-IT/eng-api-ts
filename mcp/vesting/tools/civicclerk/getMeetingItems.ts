// Ported from finance-mcp-server-ts's tools/civicclerk/getMeetingItems.ts, adapted to this
// server's conventions (z.object() inputSchema, describeError()).
import { z } from "zod"
import { fetchAllMeetings } from "./dateChunking"
import { flattenItems } from "./agendaUtils"
import { describeError } from "../../utils/errors"

const MAX_MEETING_ITEMS_RESULTS = 200

export const getMeetingItemsTool = {
  name: "civicclerk_get_meeting_items",
  description:
    "Fetch and return flattened agenda items for meetings from CivicClerk (Franklin TN). Filter by a specific meeting id (as the id parameter) to get items for a specific meeting. Use this when you need to inspect individual agenda items, with full untruncated description text, rather than full meeting objects. TIP: to search agenda item text for a topic/keyword across meetings, use civicclerk_search_agenda_items instead. IMPORTANT FOR SPEED: this still fetches every meeting in startDate/endDate before filtering down to id -- there is no cheaper single-meeting lookup. Once you know the meeting's meetingDate (from civicclerk_get_meetings or civicclerk_get_latest_meeting), pass a TIGHT range (that exact date, or +/- 1 day), not whatever wider range you used to originally find the meeting -- reusing a wide range here re-fetches everything in it just to discard all but one meeting.",
  inputSchema: z.object({
    startDate: z.string().describe("Start date in ISO 8601 format (e.g., 2025-01-01). When id is already known, use a tight range around its meetingDate, not a wide search range -- see IMPORTANT FOR SPEED above."),
    endDate: z.string().describe("End date in ISO 8601 format (e.g., 2025-01-31). Same tight-range guidance as startDate applies when id is set."),
    id: z.number().optional().describe("Optional filter by meeting ID to return items for a specific meeting -- strongly recommended: omitting it flattens items for every meeting in the date range, which can be large."),
    limit: z.number().optional().describe("Maximum number of meetings' worth of items to return per page (default: 50, max: 200)"),
    offset: z.number().optional().describe("Number of meetings to skip for pagination (default: 0). Use with hasMore/nextOffset from previous response to get next page."),
  }),
  handler: (
    async ({
      startDate,
      endDate,
      id,
      limit = 50,
      offset = 0,
    }: {
      startDate: string
      endDate: string
      id?: number
      limit?: number
      offset?: number
    }) => {
      try {
        const { meetings: fetchedMeetings } = await fetchAllMeetings(startDate, endDate)
        let meetings = fetchedMeetings

        if(id !== undefined) {
          meetings = meetings.filter((meeting: any) => meeting.id === id)
        }

        const total = meetings.length
        const enforcedLimit = Math.min(limit, MAX_MEETING_ITEMS_RESULTS)
        meetings = meetings.slice(offset, offset + enforcedLimit)

        const flattenedMeetings = (meetings as any[]).map((meeting) => ({
          meetingId: meeting.id,
          meetingName: meeting.name,
          meetingDate: meeting.meetingDate,
          items: flattenItems(meeting.items || []),
        }))

        const result = {
          data: flattenedMeetings,
          pagination: {
            offset,
            limit: enforcedLimit,
            returned: flattenedMeetings.length,
            total,
            hasMore: total > offset + enforcedLimit,
            ...(total > offset + enforcedLimit && { nextOffset: offset + enforcedLimit }),
          },
        }

        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        }
      } catch(error) {
        return {
          content: [
            { type: "text" as const, text: `Error fetching meeting items: ${ describeError(error) }` },
          ],
        }
      }
    }
  ) as any,
}
