import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { errorHandler } from './middleware/error.middleware'
import router from './routes/index'

const app = express()

const allowedOriginPatterns = [
  /^http:\/\/localhost:\d+$/,
  /^https:\/\/patrimonio-web(?:-[a-z0-9-]+)?\.vercel\.app$/,
]

app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === env.CLIENT_URL || allowedOriginPatterns.some((pattern) => pattern.test(origin))) {
      callback(null, true)
      return
    }
    callback(new Error('Origin nÃ£o permitido pelo CORS'))
  },
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
