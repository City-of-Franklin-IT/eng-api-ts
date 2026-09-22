import pino from "pino"

// Mirrors eng-api-ts's own src/utils/logger.ts -- duplicated rather than
// imported since this is a standalone process with its own dependency tree
// (see mcp/stormwater/README.md).
process.env.TZ = "America/Chicago"

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development"
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
})

export default logger
