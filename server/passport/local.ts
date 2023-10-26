import bcrypt from 'bcrypt'
import { IStrategyOptions, VerifyFunction } from 'passport-local'
import { Logger as WinstonLogger } from 'winston'
import Logger from '../global/logger'
import User from '../schema/user'

interface ILocalStrategy {
  getStrategyOptions(): IStrategyOptions
  verifyFunction: VerifyFunction
}

class LocalStrategy implements ILocalStrategy {
  private static instance: LocalStrategy
  private strategyOptions: IStrategyOptions
  private log: WinstonLogger
  private constructor() {
    this.strategyOptions = {
      usernameField: 'username',
      passwordField: 'password',
    }
    this.log = Logger.getInstance().getLogger()
  }
  public static getInstance(): LocalStrategy {
    if (!LocalStrategy.instance) {
      LocalStrategy.instance = new LocalStrategy()
    }
    return LocalStrategy.instance
  }

  public getStrategyOptions(): IStrategyOptions {
    return this.strategyOptions
  }

  public verifyFunction: VerifyFunction = async (
    username,
    password,
    done
  ): Promise<void> => {
    try {
      this.log.debug(
        'verifyFunction:',
        'username:',
        username,
        'password:',
        password
      )
      const user = await User.findOne({ username })
      if (user !== null) {
        const result: boolean = await bcrypt.compare(password, user.password)
        if (result) {
          return done(null, user)
        } else {
          return done(null, false, { message: 'bad password' })
        }
      } else {
        return done(null, false, {
          message: 'Please check your email and password.',
        })
      }
    } catch (error) {
      this.log.error('VerifyFunctionError:', error)
      console.log('error => ', error)
      return done(error)
    }
  }
}

export default LocalStrategy
