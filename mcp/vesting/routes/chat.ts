import { Express, Request, Response } from "express"
import { randomUUID } from "crypto"
import { entra } from "../middleware/entra"
import { runChatTurn } from "../utils/agentLoop"
import { clearHistory } from "../utils/chatSessions"
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
      logger.error(`Chat turn error: ${ error }`)
      res.status(500).json({ error: "Failed to generate a response" })
    }
  })

  // --- Explicit "start a new conversation" reset ---
  app.delete("/vesting/chat/:sessionId", entra, (req: Request, res: Response) => {
    clearHistory(String(req.params.sessionId))
    res.status(204).end()
  })
}
