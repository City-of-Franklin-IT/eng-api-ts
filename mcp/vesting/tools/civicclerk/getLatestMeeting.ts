import { z } from "zod"
import { fetchAllMeetings } from "./dateChunking"
import { filterMeetingResponseSlim } from "./filterFields"
import { describeError } from "../../utils/errors"
import { formatLocalDate } from "../../utils/filters"

// CivicClerk's API only accepts date-range queries -- there's no "give me the latest N"
// endpoint. Answering "what's the most recent FMPC meeting?" by guessing a date range risks
// either missing it (guessed range too narrow) or a slow/timing-out multi-year fetch (guessed
// range too wide -- see dateChunking.ts's notes on the vendor being slow/hangy on wide windows).
// Searching backward in small windows and stopping at the first one with a match keeps the
// common case (a committee that meets at least every few months) fast, while still terminating
// instead of defaulting to a multi-year scan.
const LOOKBACK_WINDOWS_DAYS = [30, 90, 180, 365, 730, 1825]

export const getLatestMeetingTool = {
  name: "civicclerk_get_latest_meeting",
  description: `Find the single most recent CivicClerk (Franklin TN) meeting matching a name filter -- e.g. "when was the most recent FMPC meeting?" or "when's the last BOMA meeting?"

WHY THIS EXISTS: CivicClerk's API only takes date ranges, not "give me the latest N" -- asking civicclerk_get_meetings for "the most recent" without a date range means guessing one, which either misses the answer (too narrow) or risks a slow/timing-out multi-year fetch (too wide, guessed defensively). This tool searches backward in small windows (last 30 days, then 90, 180, 365, 730, 1825) and stops at the first window with a match, so a regularly-meeting committee (FMPC, BOMA) resolves in one fast call instead of a multi-year scan.

Returns a single slim meeting (id, name, meetingDate) plus which lookback window it was found in, or an explicit "not found" result if nothing matched within about 5 years. For full agenda detail on the result, follow up with civicclerk_get_meetings using its id and includeItems: true.`,
  inputSchema: z.object({
    nameFilter: z.string().describe("Case-insensitive substring filter on meeting name (e.g. 'Planning Commission', 'BOMA')"),
  }),
  handler: (async ({ nameFilter }: { nameFilter: string }) => {
    try {
      const today = new Date()
      const lower = nameFilter.toLowerCase()

      for(const lookbackDays of LOOKBACK_WINDOWS_DAYS) {
        const start = new Date(today)
        start.setDate(start.getDate() - lookbackDays)

        const { meetings } = await fetchAllMeetings(formatLocalDate(start), formatLocalDate(today))
        const matches = meetings.filter((m: any) => m.name?.toLowerCase().includes(lower))

        if(matches.length > 0) {
          const latest = matches.reduce((best: any, m: any) =>
            new Date(m.meetingDate).getTime() > new Date(best.meetingDate).getTime() ? m : best
          )

          return {
            content: [{
              type: "text" as const,
              text: JSON.stringify({
                data: filterMeetingResponseSlim(latest),
                foundWithinDays: lookbackDays,
              }, null, 2),
            }],
          }
        }
      }

      const maxLookback = LOOKBACK_WINDOWS_DAYS[LOOKBACK_WINDOWS_DAYS.length - 1]
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            data: null,
            note: `No meeting matching "${ nameFilter }" found within the last ${ maxLookback } days.`,
          }, null, 2),
        }],
      }
    } catch(error) {
      return {
        content: [{ type: "text" as const, text: `Error finding latest meeting: ${ describeError(error) }` }],
      }
    }
  }) as any,
}
