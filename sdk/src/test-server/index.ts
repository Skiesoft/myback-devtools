import express, { Request, Response, NextFunction } from 'express'
import http from 'http'
import indexRouter from './routes/index'
import cors from 'cors'

interface APIInstance {
  app: express.Express
  server: http.Server
}

function start (): APIInstance {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))

  app.use('/v1/', indexRouter)

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })

  const port = parseInt(process.env.PORT ?? '3000', 10)
  const server = app.listen(port, () => {
    console.log(`Test server started on ${port}`)
  })

  return {
    app,
    server
  }
}

if (require.main === module) {
  start()
}

export default {
  start
}
