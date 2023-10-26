import { Router } from 'express'
import Logger from '../../../global/logger'

const router = Router()

router.get('/local', (req, res, next) => {
  const log = Logger.getInstance().getLogger()
  req.logout((err) => {
    if (err) {
      log.error('/logout -> get:local res.logout error-:', err)
      return next(err)
    }
  })
  req.session.destroy((err) => {
    if (err) {
      log.error('/logout -> get:local res.logout error-:', err)
      return next(err)
    }
    res.clearCookie('sid')
    return res.status(200).send({ success: true })
  })
})

export default router
