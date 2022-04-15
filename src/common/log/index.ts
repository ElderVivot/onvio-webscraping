import pino from 'pino'

export const logger = pino({
    enabled: true,
    level: 'info'
})