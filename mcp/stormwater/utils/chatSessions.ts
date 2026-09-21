import type Anthropic from "@anthropic-ai/sdk"

type MessageParam = Anthropic.Messages.MessageParam

// In-memory only, same as the MCP transports Map in routes/mcp.ts — lost on
// restart/redeploy, which is fine for a chat panel and not meant to be a
// durable record.
const sessions = new Map<string, MessageParam[]>()

// Bounds how much history (and therefore tokens) a single session accumulates.
// Trimmed in whole user+assistant turns so a tool_result is never left
// orphaned from the tool_use that preceded it.
const MAX_MESSAGES_PER_SESSION = 20

export const getHistory = (sessionId: string): MessageParam[] => sessions.get(sessionId) ?? []

export const saveHistory = (sessionId: string, messages: MessageParam[]) => {
  let trimmed = messages

  while(trimmed.length > MAX_MESSAGES_PER_SESSION) {
    trimmed = trimmed.slice(2)
  }

  sessions.set(sessionId, trimmed)
}

export const clearHistory = (sessionId: string) => {
  sessions.delete(sessionId)
}
