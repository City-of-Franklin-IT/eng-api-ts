import { Request, Response, NextFunction } from "express"
import { timingSafeEqual } from "crypto"

// Gates the raw MCP endpoint (`/stormwater`), which can't go through `entra`
// since MCP clients have no OAuth/MSAL flow to acquire a bearer token — see
// README.md's Security section. A static shared secret both this server and
// each MCP client config hold, sent as `X-MCP-Key`.
export const mcpKey = (req: Request, res: Response, next: NextFunction) => {
  const expected = process.env.MCP_API_KEY
  const provided = req.headers["x-mcp-key"]

  // Plain !== leaks how many leading characters matched via response timing
  // (CWE-208) -- timingSafeEqual compares in constant time instead. It
  // throws on unequal-length buffers, so the length check has to happen
  // first (a key's length isn't itself sensitive, unlike its content).
  const isValid = typeof expected === "string" && expected.length > 0
    && typeof provided === "string"
    && provided.length === expected.length
    && timingSafeEqual(Buffer.from(provided), Buffer.from(expected))

  if(!isValid) {
    res.status(401).json({ error: "Not authorized to access this route" })
    return
  }

  next()
}
