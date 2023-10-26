export type EnvMode = 'prod' | 'uat' | 'stage' | 'qa' | 'dev' | 'local'

export type ServerOptions = {
  port: number
  debug: boolean
  envMode: EnvMode
}

export enum EnvModeType {
  PROD = 'prod',
  UAT = 'uat',
  STAGE = 'stage',
  QA = 'qa',
  DEV = 'dev',
  LOCAL = 'local',
}

export type SignupRequestBody = {
  username: string
  password: string
  email: string
  name: string
}
