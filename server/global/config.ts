export interface IConfig {
  initConfigFromEnv(env: unknown): Config
}

export type EnvConfig = {
  PORT: string
  MONGODB_URL: string
  MONGODB_USER: string
  MONGODB_PASS: string
  MONGODB_DB_NAME: string
  COOKIE_SECRET: string
}

class Config implements IConfig {
  private static instance: Config
  private envConfig?: EnvConfig
  private constructor() {}
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config()
    }
    return Config.instance
  }

  public initConfigFromEnv(env: unknown): Config {
    if ((env as { PORT?: string })?.PORT == undefined) {
      throw new Error('Env: PORT not found')
    }
    if ((env as { MONGODB_URL?: string })?.MONGODB_URL == undefined) {
      throw new Error('Env: MONGODB_URL not found')
    }
    if ((env as { MONGODB_USER?: string })?.MONGODB_USER == undefined) {
      throw new Error('Env: MONGODB_USER not found')
    }
    if ((env as { MONGODB_PASS?: string })?.MONGODB_PASS == undefined) {
      throw new Error('Env: MONGODB_PASS not found')
    }
    if ((env as { MONGODB_DB_NAME?: string })?.MONGODB_DB_NAME == undefined) {
      throw new Error('Env: MONGODB_DB_NAME not found')
    }
    if ((env as { COOKIE_SECRET?: string })?.COOKIE_SECRET == undefined) {
      throw new Error('Env: COOKIE_SECRET not found')
    }
    this.envConfig = env as EnvConfig
    return Config.instance
  }

  public getConfig(keyName: keyof EnvConfig): string {
    return this.envConfig?.[keyName] as string
  }
}

export default Config
