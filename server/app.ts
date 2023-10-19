import Server from './server'

const server = new Server()

server.start().catch((err) => console.error(err))
