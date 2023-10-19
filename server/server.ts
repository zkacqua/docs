import * as express from 'express'
import * as http from 'http'
import indexRoute from './routes/index'

class Server extends http.Server {
  public app: express.Application

  constructor() {
    const app: express.Application = express()
    super(app)
    this.app = app
  }

  private setRouter() {
    this.app.use('/', indexRoute)
  }

  private setMiddleware() {
    this.setRouter()
  }

  async start() {
    this.app.set('port', 4004)
    this.setMiddleware()
    return this.app.listen(this.app.get('port'), () => {
      console.log(`server : http://localhost:${this.app.get('port')}`)
    })
  }
}

export default Server
