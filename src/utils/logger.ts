import pino from 'pino'

// Set timezone to US/Chicago for log timestamps
process.env.TZ = 'America/Chicago'

const logger = pino({
  level: 'info',
  transport: process.env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined
})

export default logger