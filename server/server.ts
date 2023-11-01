import RedisStore from 'connect-redis'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import fs from 'fs'
import helmet from 'helmet'
import hpp from 'hpp'
import http from 'http'
import mongoose from 'mongoose'
import morgan from 'morgan'
import passport from 'passport'
import path from 'path'
import process from 'process'
import { createClient } from 'redis'
import { type Logger as WinstonLogger } from 'winston'
import Config, { EnvConfigKey } from './global/config'
import Logger from './global/logger'
import PassportAuth from './passport'
import indexRoute from './routes/index'
import { EnvMode, EnvModeType, ServerOptions } from './types'

declare module 'express' {
  interface User {
    uid: string
  }
}

declare module 'express-session' {
  export interface SessionData {
    user: { uid: string }
  }
}

class Server extends http.Server {
  private static PID_FILE: string = 'server.pid'
  public app: express.Application
  private pidFilePath: string
  private log?: WinstonLogger
  private envConfig?: Config

  constructor() {
    const app: express.Application = express()
    super(app)
    this.app = app
    this.pidFilePath = path.resolve(process.cwd(), Server.PID_FILE)
  }

  private setPassport() {
    PassportAuth.getInstance().init()
    this.app.use(passport.initialize())
    this.app.use(passport.session())
  }

  private setRouter() {
    this.app.use('/', indexRoute)
  }

  private writePidFile(pid: number) {
    fs.writeFileSync(this.pidFilePath, `${pid}`)
  }

  private stopServer(): void {
    this.log?.info(`Stopping server...`)
    const pid = fs.readFileSync(this.pidFilePath, 'utf-8')
    fs.unlinkSync(this.pidFilePath)
    this.log?.debug(`PID file path: ${this.pidFilePath}, PID: ${pid}`)
    if (pid == undefined) {
      throw new Error('Pid is undefined')
    }
    process.kill(Number(pid))
    this.log?.info('Server stopped')
  }

  async stop(options: { debug: boolean; level?: string }): Promise<void> {
    this.log = Logger.getInstance()
      .initLogger({ debug: options.debug, level: options?.level ?? 'info' })
      .getLogger()
    this.stopServer()
  }

  private setLogger(options?: {
    mode: EnvMode
    level: string
    debug: boolean
  }): void {
    this.log = Logger.getInstance()
      .initLogger({
        mode: options?.mode ?? 'local',
        level: options?.level ?? 'info',
        debug: options?.debug ?? false,
      })
      .getLogger()
  }

  private setEnvConfig(): void {
    this.envConfig = Config.getInstance()
  }

  private async setDatabase(options: {
    debug: boolean
    mode: EnvMode
  }): Promise<void> {
    try {
      if (!this.envConfig) {
        throw new Error('EnvConfig not configured')
      }
      const MONGODB_URL = this.envConfig.getConfig(EnvConfigKey.MONGODB_URL)
      const MONGODB_USER = this.envConfig.getConfig(EnvConfigKey.MONGODB_USER)
      const MONGODB_PASS = this.envConfig.getConfig(EnvConfigKey.MONGODB_PASS)
      const MONGODB_DB_NAME = this.envConfig.getConfig(
        EnvConfigKey.MONGODB_DB_NAME
      )
      await mongoose.connect(MONGODB_URL, {
        user: MONGODB_USER,
        pass: MONGODB_PASS,
        dbName: MONGODB_DB_NAME,
      })
      if (options.mode !== EnvModeType.LOCAL || options.debug) {
        mongoose.set('debug', true)
      }
      this.log?.info('✅ Connected to DB')
    } catch (err) {
      this.log?.error('❌ Error on DB Connection:${err}')
    }
  }

  private async setMiddleware(options: {
    debug: boolean
    mode: EnvMode
  }): Promise<void> {
    if (!this.envConfig) {
      throw new Error('EnvConfig not configured')
    }
    const COOKIE_SECRET = this.envConfig.getConfig(EnvConfigKey.COOKIE_SECRET)
    const SESSION_STORE = this.envConfig.getConfig(EnvConfigKey.SESSION_STORE)
    if (options.mode !== EnvModeType.LOCAL || SESSION_STORE === 'redis') {
      this.app.use(hpp())
      this.app.use(helmet())
      this.app.use(
        cors({
          origin: 'zkacqua.github.io',
          credentials: true,
        })
      )
      const REDIS_DB = this.envConfig.getConfig(EnvConfigKey.REDIS_DB)
      const REDIS_HOST = this.envConfig.getConfig(EnvConfigKey.REDIS_HOST)
      const REDIS_PORT = this.envConfig.getConfig(EnvConfigKey.REDIS_PORT)
      const REDIS_PASS = this.envConfig.getConfig(EnvConfigKey.REDIS_PASS)
      const redisClient = createClient({
        url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
        password: REDIS_PASS,
        database: Number(REDIS_DB),
        name: `docs-${options.mode}`,
      })
      await redisClient.connect()
      const redisStore = new RedisStore({
        client: redisClient,
        prefix: `docs-${options.mode}:`,
      })
      redisClient.on('connect', () => {
        this.log?.info('Redis server connected')
      })
      redisClient.on('disconnect', () => {
        this.log?.info('Redis server disconnected')
      })
      this.app.use(
        session({
          store: redisStore,
          resave: false,
          saveUninitialized: false,
          secret: COOKIE_SECRET,
          cookie: {
            httpOnly: true,
            secure: true,
          },
          name: 'sid',
        })
      )
    } else {
      this.app.use(
        session({
          resave: false,
          saveUninitialized: false,
          secret: COOKIE_SECRET,
          cookie: {
            httpOnly: true,
            secure: false,
          },
          name: 'sid',
        })
      )
    }
    this.app.use(
      morgan(
        options.debug || options.mode === EnvModeType.LOCAL ? 'dev' : 'combined'
      )
    )
    this.app.use('/static', express.static(path.join(__dirname, 'assets')))
    this.app.use('/media', express.static(path.join(__dirname, 'uploads')))
    this.app.use(cookieParser(COOKIE_SECRET))
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.setPassport()
    this.app.set(
      'views',
      options.mode === EnvModeType.LOCAL
        ? path.join(process.cwd(), 'server/views')
        : path.join(__dirname, 'views')
    )
    this.app.set('view engine', 'ejs')
    this.setRouter()
  }

  async start(options: ServerOptions): Promise<http.Server> {
    this.writePidFile(process.pid)
    this.app.set('port', options.port)
    this.setLogger()
    this.setEnvConfig()
    await this.setDatabase({ debug: options.debug, mode: options.envMode })
    this.setMiddleware({ debug: options.debug, mode: options.envMode })
    return this.app.listen(this.app.get('port'), () => {
      this.log?.info(`server : http://localhost:${this.app.get('port')}`)
    })
  }
}

export default Server
