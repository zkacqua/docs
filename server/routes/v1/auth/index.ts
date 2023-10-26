import { Router } from 'express'
import loginRoute from './login'
import logoutRoute from './logout'
import signUpRoute from './signup'

const router = Router()

router.use('/login', loginRoute)
router.use('/logout', logoutRoute)
router.use('/signup', signUpRoute)

export default router
