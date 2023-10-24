/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express'
import http from 'http'
import { Server, Socket } from 'socket.io'
import { type Logger as WinstonLogger } from 'winston'
import Logger from './global/logger'

interface ISocketIO {
  start(httpServer: http.Server, serverApp: express.Application): Promise<void>
}

class SocketIO implements ISocketIO {
  private static instance: SocketIO
  private ioServer?: Server
  private log: WinstonLogger

  private constructor() {
    this.log = Logger.getInstance().getLogger()
  }
  public static getInstance(): SocketIO {
    if (!SocketIO.instance) {
      SocketIO.instance = new SocketIO()
    }
    return SocketIO.instance
  }
  public async start(
    httpServer: http.Server,
    serverApp: express.Application
  ): Promise<void> {
    this.log.info('starting socket.io...')
    this.ioServer = new Server(httpServer, {
      path: '/socket.io',
    })
    serverApp.set('io', this.ioServer)
    this.init()
    this.log.info('socket.io started')
  }

  private init(): void {
    if (!this.ioServer) {
      throw new Error('SocketIO server not initialized')
    }
    this.ioServer.on('connection', (socket: Socket) => {
      this.log?.info(`socket ${socket.id} connected`)
      socket.on('disconnect', (reason, description) => {
        this.log?.info(
          `socket ${socket.id} disconnected. Reason: ${reason} and Description: ${description}`
        )
      })
    })
  }
}

export default SocketIO
