import { Express, Request, Response } from "express"
import { randomUUID } from "crypto"
import { entra } from "../middleware/entra"
import { runChatTurn } from "../utils/agentLoop"
import { clearHistory } from "../utils/chatSessions"
import { describeError } from "../utils/errors"
import logger from "../utils/logger"

export const setupChatRoutes = (app: Express, tools: any[]) => {
  // --- Chat turn: { sessionId?, message } -> { sessionId, reply } ---
  app.post("/vesting/chat", entra, async (req: Request, res: Response) => {
    const { message, sessionId } = req.body ?? {}

    if(typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "message is required" })
      return
    }

    const activeSessionId = typeof sessionId === "string" && sessionId ? sessionId : randomUUID()

    try {
      const reply = await runChatTurn(tools, activeSessionId, message.trim())
      res.json({ sessionId: activeSessionId, reply })
    } catch(error) {
      // Anthropic's APIError bakes the status + body into .message (e.g. "400 prompt is too
      // long: N tokens > 200000 maximum"), so a real context-window overflow is already visible
      // here -- see chatSessions.ts's history size caps for the actual fix. describeError() (same
      // convention as every tool's catch block) just reads a bit cleaner than the raw error.
      logger.error(`Chat turn error: ${ describeError(error) }`)
      res.status(500).json({ error: "Failed to generate a response" })
    }
  })

  // --- Explicit "start a new conversation" reset ---
  app.delete("/vesting/chat/:sessionId", entra, (req: Request, res: Response) => {
    clearHistory(String(req.params.sessionId))
    res.status(204).end()
  })
}
