import express from 'express'
import modelRouter from './model'

const router = express.Router()

router.get('/', (req, res, next) => {
  res.status(200).json({
    data: [
      { id: 'default' }
    ]
  })
})

router.use('/default/model', modelRouter)

export default router
