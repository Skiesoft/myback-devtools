import express from 'express'
import databaseRouter from './database'
import storageRouter from './storage'

const router = express.Router()

router.use('/database/', databaseRouter)
router.use('/storage/', storageRouter)

export default router
