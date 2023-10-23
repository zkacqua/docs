export type EnvMode = 'prod' | 'uat' | 'stage' | 'qa' | 'dev'

export type ServerOptions = {
  port: number
  debug: boolean
  envMode: EnvMode
}
