// Ported verbatim from finance-mcp-server-ts's tools/civicclerk/dateChunking.ts.
import { get } from "./client"
import { meetingCache, createDateRangeCacheKey } from "./cache"

const DAY_MS = 24 * 60 * 60 * 1000

// CivicClerk is a small municipal vendor API that has shown slow (20-25s+) responses and
// occasional hangs even under sequential load -- cap concurrent chunk requests instead of
// firing a wide date range's chunks all at once.
const CHUNK_FETCH_CONCURRENCY = 4

const fetchChunksWithConcurrencyLimit = async <T>(
  chunks: { start: string; end: string }[],
  path: string
): Promise<PromiseSettledResult<T>[]> => {
  const results: PromiseSettledResult<T>[] = new Array(chunks.length)
  let nextIndex = 0

  const worker = async () => {
    while(nextIndex < chunks.length) {
      const i = nextIndex++
      const chunk = chunks[i]
      try {
        const value = await get<T>(path, { startDate: chunk.start, endDate: chunk.end })
        results[i] = { status: "fulfilled", value }
      } catch(reason) {
        results[i] = { status: "rejected", reason }
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CHUNK_FETCH_CONCURRENCY, chunks.length) }, worker)
  )

  return results
}

export const chunkDateRange = (
  startDate: string,
  endDate: string,
  maxDays = 90
): { start: string; end: string }[] => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const chunks: { start: string; end: string }[] = []

  let chunkStart = start
  while(chunkStart <= end) {
    const chunkEnd = new Date(Math.min(chunkStart.getTime() + (maxDays - 1) * DAY_MS, end.getTime()))
    chunks.push({
      start: chunkStart.toISOString().slice(0, 10),
      end: chunkEnd.toISOString().slice(0, 10),
    })
    chunkStart = new Date(chunkEnd.getTime() + DAY_MS)
  }

  return chunks
}

export const fetchAllMeetings = async (
  startDate: string,
  endDate: string
): Promise<{ meetings: any[]; chunkCount: number; totalRangeDays: number; fromCache: boolean }> => {
  const cacheKey = createDateRangeCacheKey("meetings", startDate, endDate)

  const cachedMeetings = meetingCache.get(cacheKey)
  if(cachedMeetings) {
    const totalRangeDays = Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / DAY_MS
    ) + 1
    return { meetings: cachedMeetings, chunkCount: 0, totalRangeDays, fromCache: true }
  }

  const chunks = chunkDateRange(startDate, endDate)
  const seen = new Map<any, any>()

  const responses = await fetchChunksWithConcurrencyLimit<any>(chunks, "/public-api/Meetings")

  for(const result of responses) {
    if(result.status === "fulfilled") {
      const meetings: any[] = Array.isArray(result.value) ? result.value : result.value?.items || []
      for(const meeting of meetings) {
        seen.set(meeting.id, meeting)
      }
    }
    // If rejected, continue processing other chunks (graceful degradation)
  }

  const meetings = Array.from(seen.values())
  meetingCache.set(cacheKey, meetings)

  const totalRangeDays = Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / DAY_MS
  ) + 1

  return { meetings, chunkCount: chunks.length, totalRangeDays, fromCache: false }
}
