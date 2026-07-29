import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { errorHandler } from './middleware/error.middleware'
import router from './routes/index'

const app = express()

app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api', router)
app.use(errorHandler)

export default app
