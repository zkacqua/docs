import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.send({ hello: 'world2' })
})

export default router
