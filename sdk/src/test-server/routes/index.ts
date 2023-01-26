import express from 'express'
import databaseRouter from './database'

const router = express.Router()

router.use('/database/', databaseRouter)

export default router
