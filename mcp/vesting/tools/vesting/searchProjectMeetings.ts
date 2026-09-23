import { TYPES } from "tedious"
import { z } from "zod"
import { executeQuery, QueryParam } from "../mssql/connection"
import { fetchAllMeetings } from "../civicclerk/dateChunking"
import { searchItems } from "../civicclerk/agendaUtils"
import { searchResultsCache, createSearchCacheKey } from "../civicclerk/cache"
import { describeError } from "../../utils/errors"
import { formatLocalDate } from "../../utils/filters"

const DAY_MS = 24 * 60 * 60 * 1000
const SPARSE_DATA_WARNING_DAYS = 2 * 365
const MAX_SEARCH_RESULTS = 100
const DEFAULT_LOOKBACK_YEARS = 3

// Vesting projects (Development Plan / Preliminary Plat / Site Plan) are heard by the Franklin
// Municipal Planning Commission (FMPC) before going to the Board of Mayor and Aldermen (BOMA)
// for final approval -- per department feedback, that's the pair of committees these projects
// actually land on. Scoping to just these two (instead of every committee CivicClerk tracks)
// keeps civicclerk_search_agenda_items's already-fetched meeting set smaller to scan and the
// response payload smaller to return, which matters given the vendor API has no server-side
// field selection or pagination of its own (see ../civicclerk/README notes in this server's
// top-level README).
//
// Verified against live 2025 CivicClerk data (Events full-year + Meetings sampled across
// Jan/Jun/Nov). Each keyword earns its place -- none are redundant, and DON'T trim this to just
// the two abbreviations:
//   - "Franklin Municipal Planning Commission"  -- FMPC's own main recurring meeting; the literal
//     substring "FMPC" never appears in this name, so only "Planning Commission" catches it.
//   - "Board of Mayor and Aldermen Meeting"      -- BOMA's own main recurring meeting; the literal
//     substring "BOMA" never appears in this name either, so only "Board of Mayor" catches it.
//   - "BOMA Work Session" / "BOMA Mobile Work Session" -- these DO contain literal "BOMA" but not
//     "Board of Mayor", so "BOMA" is the only keyword that catches them.
//   - "BOMA & FMPC Joint Conceptual Workshop"    -- contains both abbreviations.
// i.e. dropping "FMPC" or "BOMA" as "redundant" with the spelled-out forms would silently miss
// each committee's own main meeting -- the opposite of what those two look redundant with.
export const DEFAULT_DEVELOPMENT_COMMITTEE_KEYWORDS = ["FMPC", "Planning Commission", "BOMA", "Board of Mayor"]

const matchesAnyCommittee = (meetingName: string | undefined, keywords: string[]): boolean => {
  if(!meetingName) return false
  const lower = meetingName.toLowerCase()
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()))
}

export const searchProjectMeetingsTool = {
  name: "vesting_search_project_meetings",
  description:
    `Search for a vesting project's appearances on public meeting agendas (CivicClerk, Franklin TN) -- e.g. "has this project been on FMPC or BOMA yet?"

HOW IT WORKS:
- Looks up the project's name (and type/COF) from the vesting database by uuid
- Searches agenda item text for that name (or an overridden query) using the same engine as civicclerk_search_agenda_items
- Scoped by default to Franklin Municipal Planning Commission (FMPC) and Board of Mayor and Aldermen (BOMA) meetings -- the two committees vesting projects are actually heard by -- to keep the scan and response small. Pass committees to widen or narrow this.
- Defaults to the last ${ DEFAULT_LOOKBACK_YEARS } years through today if no date range is given; override startDate/endDate for older projects.

Returns the same lean, paginated match shape as civicclerk_search_agenda_items, with the resolved project's name/type/COF attached and the committee keyword list actually used.`,
  inputSchema: z.object({
    projectUuid: z.string().describe("The vesting project's uuid (matches project.uuid)"),
    query: z.string().optional().describe("Override the search query instead of using the project's own name (e.g. if the official name doesn't match how it's phrased on agendas)"),
    startDate: z.string().optional().describe(`Start date in ISO 8601 format. Defaults to ${ DEFAULT_LOOKBACK_YEARS } years before today.`),
    endDate: z.string().optional().describe("End date in ISO 8601 format. Defaults to today."),
    committees: z.array(z.string()).optional().describe("Override the default FMPC/BOMA committee-name substrings (case-insensitive) with your own list -- e.g. to widen the search to another committee/meeting type."),
    limit: z.number().optional().describe("Maximum number of matching items to return per page (default: 10, max: 100)"),
    offset: z.number().optional().describe("Number of items to skip for pagination (default: 0). Use with hasMore/nextOffset from previous response to get next page."),
  }),
  handler: (
    async ({
      projectUuid,
      query,
      startDate,
      endDate,
      committees,
      limit = 10,
      offset = 0,
    }: {
      projectUuid: string
      query?: string
      startDate?: string
      endDate?: string
      committees?: string[]
      limit?: number
      offset?: number
    }) => {
      try {
        const projectResult = await executeQuery(
          "SELECT name, cof, type FROM project WHERE uuid = @projectUuid",
          [{ name: "projectUuid", type: TYPES.UniqueIdentifier, value: projectUuid }] as QueryParam[]
        )
        const project = projectResult.rows[0]
        if(!project) {
          return {
            content: [{ type: "text" as const, text: `Error: no project found with uuid ${ projectUuid }` }],
          }
        }

        const effectiveQuery = query ?? project.name
        const today = new Date()
        const defaultStart = new Date(today)
        defaultStart.setFullYear(defaultStart.getFullYear() - DEFAULT_LOOKBACK_YEARS)
        const effectiveStartDate = startDate ?? formatLocalDate(defaultStart)
        const effectiveEndDate = endDate ?? formatLocalDate(today)
        const effectiveCommittees = committees && committees.length > 0 ? committees : DEFAULT_DEVELOPMENT_COMMITTEE_KEYWORDS

        const cacheKey = createSearchCacheKey(effectiveQuery, effectiveStartDate, effectiveEndDate, effectiveCommittees.join(","))
        const cached: { matches: any[]; meetingsScanned: number; meetingsWithAgendaData: number } | null =
          searchResultsCache.get(cacheKey)
        let allMatches: any[]
        let meetingsScanned: number
        let meetingsWithAgendaData: number
        let fromCache = true

        if(!cached) {
          fromCache = false
          const terms = effectiveQuery.toLowerCase().split(/\s+/).filter(Boolean)
          const { meetings } = await fetchAllMeetings(effectiveStartDate, effectiveEndDate)

          const scoped = meetings.filter((m: any) => matchesAnyCommittee(m.name, effectiveCommittees))

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
          (new Date(effectiveEndDate).getTime() - new Date(effectiveStartDate).getTime()) / DAY_MS
        )

        const result: Record<string, any> = {
          project: { uuid: projectUuid, name: project.name, type: project.type, cof: project.cof },
          query: effectiveQuery,
          committees: effectiveCommittees,
          dateRange: { startDate: effectiveStartDate, endDate: effectiveEndDate },
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
          content: [{ type: "text" as const, text: `Error searching project meetings: ${ describeError(error) }` }],
        }
      }
    }
  ) as any,
}
