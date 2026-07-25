import pino from 'pino'
import config from '../config/index.js'

/**
 * Application logger (Pino). Pretty-printed in development, JSON in production.
 */
const logger = pino({
  level: config.env === 'test' ? 'silent' : config.isProduction ? 'info' : 'debug',
  ...(config.isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
})

export default logger
