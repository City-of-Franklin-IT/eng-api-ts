import Anthropic from "@anthropic-ai/sdk"
import { getHistory, saveHistory } from "./chatSessions"
import { toAnthropicTools, callTool } from "./anthropicTools"
import { formatLocalDate } from "./filters"
import logger from "./logger"

// Built lazily (not at module load) because TypeScript hoists all
// import/require calls above app.ts's dotenv.config() call -- an eager
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

const systemPrompt = () => `You are an assistant for City of Franklin engineering staff, answering questions about vesting: development projects (Development Plan / Preliminary Plat / Site Plan), their milestones, vesting periods, approvals, resolutions, and notifications.

Today's date is ${ formatLocalDate(new Date()) }.

Use the provided tools to look up data -- never guess or invent values. All data is read-only. Keep answers concise and specific (project names, dates, counts) rather than restating the question. If a tool call fails or returns no data, say so plainly instead of speculating.

Milestones (number 1 or 2) and vesting periods (10Y or 15Y) both have an "effective date" that already accounts for extensions -- vesting_list_milestones_due and vesting_list_vesting_periods return this as effectiveDate (an extension's date if one exists, otherwise the base date). Always use effectiveDate for "due"/"when" questions about milestones or vesting periods, not the raw date field, since the raw date ignores any extension that's been granted.

achieved and expired on milestones/vesting periods are nullable booleans (true, false, or null meaning "not yet determined") -- don't treat null as false when summarizing status; say "not yet determined" or omit it rather than implying it's known to be un-achieved.

vesting_list_notifications (Initial / Last Call / Lost Vesting) is the best tool for "what's coming up" or lookahead questions -- these notification dates mark the vesting-expiration lifecycle for a project. Use vesting_get_project when someone asks about a specific, named project's full history rather than piecing it together from several list calls.

The chat UI renders full markdown (via react-markdown + remark-gfm), including GFM tables, bold/italic, and lists. For genuinely tabular results -- multiple projects, milestones, or vesting periods -- use a markdown table; it's easier to scan than the same rows written out as prose. For a single record, just describe it in a sentence or two instead of a one-row table. The UI is a narrow sidebar panel, not a full page: keep tables to a handful of well-chosen columns (the ones the question actually needs) rather than dumping every field a tool returned.

Build tables (and every other answer) only from the fields the tool you already called returned. Don't make extra tool calls just to add another column for display polish unless the user specifically asked for that field -- every extra tool call is real, noticeable latency for someone waiting on a chat reply.`

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

  return reply || "I wasn't able to generate a response for that -- please try rephrasing."
}
