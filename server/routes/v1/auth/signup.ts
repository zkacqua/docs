import bcrypt from 'bcrypt'
import { Router } from 'express'
import Logger from '../../../global/logger'
import User from '../../../schema/user'
import { SignupRequestBody } from '../../../types'

const router = Router()

router.post('/local', async (req, res, next) => {
  const log = Logger.getInstance().getLogger()

  try {
    const { email, username, password, name }: SignupRequestBody = req.body
    log.debug('/signup -> local req.body-:', req.body)
    if (!email || !username || !password || !name) {
      throw new Error('name, email, username and password are required')
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({ name, email, username, password: hashedPassword })
    await user.save()
    req.login(user, async (loginError) => {
      if (loginError) {
        log.error(
          '/signup -> local req.login error-:',
          loginError,
          'user:',
          user
        )
        return next(loginError)
      }
      return res.status(201).send({ success: true, user: user })
    })
  } catch (error) {
    log.error('/signup -> local cached error-:', error)
    if ((error as { errors?: Error[] })?.errors) {
      return res.status(400).send({
        success: false,
        error: (error as { errors?: Error[] })?.errors,
      })
    }
    next(error as Error)
  }
})

export default router
