import Anthropic from "@anthropic-ai/sdk"
import { getHistory, saveHistory } from "./chatSessions"
import { toAnthropicTools, callTool } from "./anthropicTools"

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

const MAX_TOKENS = 1024

// Bounds one chat turn to this many tool_use round-trips before giving up,
// so a confused tool-call loop can't run indefinitely against the DB.
const MAX_TOOL_ITERATIONS = 6

const systemPrompt = () => `You are an assistant for City of Franklin stormwater engineering staff, answering questions about construction sites, violations, complaints, illicit discharges, inspections, and inspectors.

Today's date is ${ new Date().toISOString().slice(0, 10) }.

Use the provided tools to look up data — never guess or invent values. All data is read-only. Keep answers concise and specific (site names, dates, counts) rather than restating the question. If a tool call fails or returns no data, say so plainly instead of speculating.`

export const runChatTurn = async (tools: any[], sessionId: string, userMessage: string): Promise<string> => {
  const client = getClient()
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5"
  const anthropicTools = toAnthropicTools(tools)
  const messages: Anthropic.Messages.MessageParam[] = [
    ...getHistory(sessionId),
    { role: "user", content: userMessage },
  ]

  let response = await client.messages.create({
    model,
    max_tokens: MAX_TOKENS,
    system: systemPrompt(),
    tools: anthropicTools,
    messages,
  })

  let iterations = 0

  while(response.stop_reason === "tool_use" && iterations < MAX_TOOL_ITERATIONS) {
    iterations += 1
    messages.push({ role: "assistant", content: response.content })

    const toolResults: Anthropic.Messages.ContentBlockParam[] = []

    for(const block of response.content) {
      if(block.type === "tool_use") {
        const text = await callTool(tools, block.name, block.input)
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: text })
      }
    }

    messages.push({ role: "user", content: toolResults })

    response = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      system: systemPrompt(),
      tools: anthropicTools,
      messages,
    })
  }

  messages.push({ role: "assistant", content: response.content })
  saveHistory(sessionId, messages)

  const reply = response.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim()

  return reply || "I wasn't able to generate a response for that — please try rephrasing."
}
