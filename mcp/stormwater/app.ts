import dotenv from "dotenv"
import { join } from "path"

// Single, authoritative env load — path is relative to the process cwd (project root)
// rather than __dirname, so it resolves the same way whether run via `tsx app.ts` (dev)
// or `tsx dist/app.js` (prod), as long as the process is started from this project's root.
dotenv.config({ path: join(process.cwd(), ".env"), quiet: true })

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import express from "express"
import tools from "./tools"
import { setupMcpRoutes } from "./routes/mcp"
import { registerAllTools } from "./utils/registerTools"

const app = express()
const PORT = parseInt(process.env.MCP_PORT || "7003", 10)
const LISTEN_HOST = "0.0.0.0"
let EXTERNAL_URL = process.env.MCP_HOST || `http://0.0.0.0:${ PORT }`

EXTERNAL_URL = new URL(EXTERNAL_URL).toString()

app.use(express.json())

// Setup MCP routes
const transports = new Map()

setupMcpRoutes(app, transports, () => {
  const mcpServer = new McpServer({ name: "stormwater-mcp-server", version: "1.0.0" })
  registerAllTools(mcpServer, tools)
  return mcpServer
})

// Start HTTP server
const server = app.listen(PORT, LISTEN_HOST, () => {
  console.log(`MCP server listening on ${ EXTERNAL_URL }`)
})

server.on('error', (err) => {
  console.error(`Server error on port ${ PORT }:`, err.message)
  process.exit(1)
})
