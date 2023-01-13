import express from 'express'
import indexRouter from './routes/index'

export const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/v1/', indexRouter)

const port = parseInt(process.env.PORT ?? '3000', 10)
export const server = app.listen(port, () => {
  console.log(`API Tester started on ${port}`)
})
