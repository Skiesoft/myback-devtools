import express from 'express'
import fileRouter from './file'

const router = express.Router()

router.get('/', (req, res, next) => {
  res.status(200).json({
    data: [
      { id: 'default' }
    ]
  })
})

router.use('/default/file', fileRouter)

export default router
