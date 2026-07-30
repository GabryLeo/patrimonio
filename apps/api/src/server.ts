import app from './app'
import { env } from './config/env'

app.listen(Number(env.PORT), () => {
  console.log(`🚀 API rodando em http://localhost:${env.PORT}`)
})
