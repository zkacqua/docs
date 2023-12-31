import passport from 'passport'
import { Strategy } from 'passport-local'
import LocalStrategy from './local'

interface IPassportAuth {
  init(): void
}

class PassportAuth implements IPassportAuth {
  private static instance: PassportAuth
  private constructor() {}
  public static getInstance(): PassportAuth {
    if (!PassportAuth.instance) {
      PassportAuth.instance = new PassportAuth()
    }
    return PassportAuth.instance
  }

  public init(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.serializeUser((user: any, done) => {
      console.log('serialize user => ', user)
      done(null, user)
    })

    passport.deserializeUser((user, done) => {
      console.log('deserialize user => ', user)
      done(null, user as Express.User)
    })

    this.useLocalStrategy()
  }

  private useLocalStrategy(): void {
    const localStrategy = LocalStrategy.getInstance()
    passport.use(
      'local',
      new Strategy(
        localStrategy.getStrategyOptions(),
        localStrategy.verifyFunction
      )
    )
  }
}

export default PassportAuth
