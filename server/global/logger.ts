import { SPLAT } from 'triple-beam'
import {
  createLogger,
  format,
  transports,
  type Logger as WinstonLogger,
} from 'winston'
import { EnvMode, EnvModeType } from '../types'
const { timestamp, combine, colorize, printf, errors, json } = format

type LoggerOptions = {
  mode?: EnvMode
  debug: boolean
  level?: string
}

export interface ILogger {
  initLogger(options?: LoggerOptions): ILogger
  getLogger(): WinstonLogger
}

class Logger {
  private static instance: Logger
  private logger?: WinstonLogger

  private constructor() {}
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  public initLogger(options?: LoggerOptions): Logger {
    this.logger = createLogger({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS a' }),
        errors({ stack: true }),
        options?.mode != undefined && options?.mode !== EnvModeType.LOCAL
          ? json()
          : printf(({ level, message, timestamp, stack, [SPLAT]: splat }) => {
              return `${timestamp} ${level}: ${stack || message} ${
                splat
                  ?.map((data?: unknown) =>
                    typeof data === 'object' ? JSON.stringify(data) : data
                  )
                  ?.filter((data?: unknown) => data != undefined)
                  ?.join(' ') ?? ''
              }`
            })
      ),
      transports: [
        new transports.Console({
          level:
            options?.debug || options?.mode === EnvModeType.LOCAL
              ? 'debug'
              : options?.level ?? 'info',
        }),
      ],
    })
    return Logger.instance
  }

  public getLogger(): WinstonLogger {
    if (!this.logger) {
      throw new Error('Logger not initialized')
    }
    return this.logger
  }
}

export default Logger
