import type Anthropic from "@anthropic-ai/sdk"

type MessageParam = Anthropic.Messages.MessageParam

// In-memory only, same as the MCP transports Map in routes/mcp.ts -- lost on
// restart/redeploy, which is fine for a chat panel and not meant to be a
// durable record.
const sessions = new Map<string, MessageParam[]>()

// Bounds how much history (and therefore tokens) a single session accumulates.
// Trimmed in whole user+assistant turns so a tool_result is never left
// orphaned from the tool_use that preceded it.
const MAX_MESSAGES_PER_SESSION = 20

// A message-COUNT cap alone isn't enough: the civicclerk_* tools' results (meeting listings,
// agenda item matches) run far larger than the original SQL-backed vesting tools' slim
// { data, pagination } envelopes, and every tool_result gets carried forward into every future
// turn's history verbatim. A handful of turns with a few large tool calls each could accumulate
// enough tokens to exceed the model's actual context window -- which surfaced as an opaque 500
// from routes/chat.ts, since the resulting Anthropic API error was never specifically surfaced,
// just caught generically. Cap total serialized size too, and belt-and-suspenders, truncate any
// single oversized tool_result so one huge call can't blow the budget by itself.
const MAX_SESSION_CHARS = 60_000
const MAX_TOOL_RESULT_CHARS = 8_000

const estimateChars = (messages: MessageParam[]): number => {
  try {
    return JSON.stringify(messages).length
  } catch {
    return 0
  }
}

const truncateOversizedToolResults = (messages: MessageParam[]): MessageParam[] =>
  messages.map((msg) => {
    if(!Array.isArray(msg.content)) return msg
    return {
      ...msg,
      content: msg.content.map((block: any) =>
        block?.type === "tool_result" &&
        typeof block.content === "string" &&
        block.content.length > MAX_TOOL_RESULT_CHARS
          ? { ...block, content: block.content.slice(0, MAX_TOOL_RESULT_CHARS) + "...[truncated for session history size]" }
          : block
      ),
    } as MessageParam
  })

export const getHistory = (sessionId: string): MessageParam[] => sessions.get(sessionId) ?? []

export const saveHistory = (sessionId: string, messages: MessageParam[]) => {
  let trimmed = truncateOversizedToolResults(messages)

  while(trimmed.length > 2 && (trimmed.length > MAX_MESSAGES_PER_SESSION || estimateChars(trimmed) > MAX_SESSION_CHARS)) {
    trimmed = trimmed.slice(2)
  }

  sessions.set(sessionId, trimmed)
}

export const clearHistory = (sessionId: string) => {
  sessions.delete(sessionId)
}
