import { Router } from 'express'
import passport from 'passport'
import Logger from '../../../global/logger'

const router = Router()

router.post(
  '/local',
  (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next()
    }
    return res
      .status(401)
      .send({ success: false, message: 'only public access' })
  },
  (req, res, next) => {
    const log = Logger.getInstance().getLogger()
    passport.authenticate(
      'local',
      (
        err: unknown,
        user: Express.User | false | null,
        info: object | string | Array<string | undefined>,
        status: number | Array<number | undefined>
      ) => {
        log.debug(
          '/local -> passport.authenticate-:',
          'user:',
          user,
          'info:',
          info,
          'status:',
          status
        )
        if (err) {
          return next(err)
        }
        if (!user) {
          throw new Error('some error')
        }
        req.login(user, async (loginError) => {
          log.error
          if (loginError) {
            console.error(loginError)
            return next(loginError)
          }
          return res.status(200).send({ success: true, user }) // 쿠키와 함께 응답
        })
      }
    )(req, res, next)
  }
)

export default router
