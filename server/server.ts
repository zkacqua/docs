import express from 'express'
import fs from 'fs'
import http from 'http'
import path from 'path'
import process from 'process'
import { type Logger as WinstonLogger } from 'winston'
import Logger from './global/logger'
import indexRoute from './routes/index'
import { EnvMode, ServerOptions } from './types'

class Server extends http.Server {
  private static PID_FILE: string = 'server.pid'
  public app: express.Application
  private pidFilePath: string
  private log?: WinstonLogger

  constructor() {
    const app: express.Application = express()
    super(app)
    this.app = app
    this.pidFilePath = path.resolve(process.cwd(), Server.PID_FILE)
  }

  private setRouter() {
    this.app.use('/', indexRoute)
  }

  private setMiddleware() {
    this.setRouter()
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
    debug?: boolean
  }): void {
    this.log = Logger.getInstance()
      .initLogger({
        mode: options?.mode ?? 'dev',
        level: options?.level ?? 'info',
        debug: options?.debug ?? false,
      })
      .getLogger()
  }

  async start(options: ServerOptions): Promise<http.Server> {
    this.writePidFile(process.pid)
    this.app.set('port', options.port)
    this.setLogger()
    this.setMiddleware()
    return this.app.listen(this.app.get('port'), () => {
      this.log?.info(`server : http://localhost:${this.app.get('port')}`)
    })
  }
}

export default Server
