import express from 'express'
import http from 'http'
import indexRouter from './routes/index'

interface APIInstance {
  app: express.Express
  server: http.Server
}

function start (): APIInstance {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))

  app.use('/v1/', indexRouter)

  const port = parseInt(process.env.PORT ?? '3000', 10)
  const server = app.listen(port, () => {
    console.log(`API Tester started on ${port}`)
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
