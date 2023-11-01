/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express'
import routerV1 from './v1'

const router = Router()

router.use('/api/v1', routerV1)

router.use('/login', (req, res) => {
  console.log('req.session => [/login]', req.session)
  if (req.session?.cookie) {
    return res.redirect('home')
  }
  return res.render('login')
})

router.use('/signup', (req, res) => {
  console.log('req.session [/signup]=> ', req.session?.id)

  return res.render('signup')
})

router.use('/', (req, res) => {
  console.log('req.session [/]=> ', req.session?.cookie)

  if (!req.session?.cookie) {
    return res.redirect('login')
  }
  return res.render('home')
})

export default router
