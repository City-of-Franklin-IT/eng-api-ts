import Anthropic from "@anthropic-ai/sdk"
import { getHistory, saveHistory } from "./chatSessions"
import { toAnthropicTools, callTool } from "./anthropicTools"
import { formatLocalDate } from "./filters"
import logger from "./logger"

// Built lazily (not at module load) because TypeScript hoists all
// import/require calls above app.ts's dotenv.config() call — an eager
// `new Anthropic(...)` here would read process.env before it's populated.
let anthropic: Anthropic | undefined

const getClient = () => {
  if(!anthropic) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return anthropic
}

// 1024 was too tight: extended thinking tokens count against this same
// budget, so a turn that reasons hard about tool selection can burn the
// whole budget on thinking and leave nothing for the actual reply --
// surfacing as stop_reason "max_tokens" and an empty-looking answer.
const MAX_TOKENS = 4096

// Bounds one chat turn to this many tool_use round-trips before giving up,
// so a confused tool-call loop can't run indefinitely against the DB.
const MAX_TOOL_ITERATIONS = 6

const systemPrompt = () => `You are an assistant for City of Franklin stormwater engineering staff, answering questions about construction sites, violations, complaints, illicit discharges, inspections, and inspectors.

Today's date is ${ formatLocalDate(new Date()) }.

Use the provided tools to look up data — never guess or invent values. All data is read-only. Keep answers concise and specific (site names, dates, counts) rather than restating the question. If a tool call fails or returns no data, say so plainly instead of speculating.

"Inspector" and "contact" are different, non-overlapping concepts here: an inspector is Franklin city staff assigned to sites (a small, fixed roster); a contact is an external person or company tied to a site (owner, contractor, property manager). When a question names a person and doesn't say which one they are, check stormwater_list_inspectors first — it's small enough to fetch in full in one call — before trying stormwater_list_contacts. Don't retry stormwater_list_contacts with variant spellings of the same name; if the first search there comes back empty, check inspectors instead of guessing at the name again.

The chat UI renders full markdown (via react-markdown + remark-gfm), including GFM tables, bold/italic, and lists. For genuinely tabular results — monthly trends, multi-site/multi-record lists, inspector or contact rollups — use a markdown table; it's easier to scan than the same rows written out as prose. For a single record, just describe it in a sentence or two instead of a one-row table. The UI is a narrow ~448px sidebar panel, not a full page: keep tables to a handful of well-chosen columns (the ones the question actually needs) rather than dumping every field a tool returned — a wide table forces horizontal scrolling inside the bubble, which looks worse than a table with fewer columns.

Build tables (and every other answer) only from the fields the tool you already called returned. Don't make extra tool calls just to add another column for display polish — e.g. don't call stormwater_list_sites to fetch preconDate after stormwater_get_inspector_workload already gave you the site list, unless the user specifically asked for that field. Every extra tool call is real, noticeable latency for someone waiting on a chat reply, so a table with fewer columns, returned quickly, beats a fuller one that took several extra round-trips to assemble.`

// Lightweight enough to leave on permanently -- duration/tokens per call is
// the minimum needed to see where a slow turn's time actually went, without
// dumping the full response.usage object into prod logs on every call. Flags
// stop_reason "max_tokens" explicitly since that means the reply got cut off
// (possibly by thinking tokens alone eating the whole budget -- see MAX_TOKENS).
const logCallTiming = (callIndex: number, startedAt: number, response: Anthropic.Messages.Message) => {
  const flag = response.stop_reason === "max_tokens" ? " -- TRUNCATED, ran out of max_tokens" : ""
  logger.info(`[timing] claude call ${ callIndex } -- ${ Date.now() - startedAt }ms, stop_reason=${ response.stop_reason }, output_tokens=${ response.usage.output_tokens }, thinking_tokens=${ response.usage.output_tokens_details?.thinking_tokens ?? 0 }${ flag }`)
}

export const runChatTurn = async (tools: any[], sessionId: string, userMessage: string): Promise<string> => {
  const turnStart = Date.now()
  const client = getClient()
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5"
  const anthropicTools = toAnthropicTools(tools)
  const messages: Anthropic.Messages.MessageParam[] = [
    ...getHistory(sessionId),
    { role: "user", content: userMessage },
  ]

  let callStart = Date.now()
  let response = await client.messages.create({
    model,
    max_tokens: MAX_TOKENS,
    system: systemPrompt(),
    tools: anthropicTools,
    messages,
  })
  logCallTiming(0, callStart, response)

  let iterations = 0

  while(response.stop_reason === "tool_use" && iterations < MAX_TOOL_ITERATIONS) {
    iterations += 1
    messages.push({ role: "assistant", content: response.content })

    const toolResults: Anthropic.Messages.ContentBlockParam[] = []

    for(const block of response.content) {
      if(block.type === "tool_use") {
        const toolStart = Date.now()
        const text = await callTool(tools, block.name, block.input)
        logger.info(`[timing] tool ${ block.name } -- ${ Date.now() - toolStart }ms`)
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: text })
      }
    }

    messages.push({ role: "user", content: toolResults })

    callStart = Date.now()
    response = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      system: systemPrompt(),
      tools: anthropicTools,
      messages,
    })
    logCallTiming(iterations, callStart, response)
  }

  logger.info(`[timing] TOTAL turn -- ${ Date.now() - turnStart }ms across ${ iterations } tool iteration(s)`)

  messages.push({ role: "assistant", content: response.content })
  saveHistory(sessionId, messages)

  const reply = response.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim()

  return reply || "I wasn't able to generate a response for that — please try rephrasing."
}
