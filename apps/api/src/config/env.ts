import { z } from 'zod'

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string().min(1),
  SUPABASE_BUCKET: z.string().default('patrimonio-files'),
  BOOTSTRAP_LOGIN_EMAIL: z.string().email().default('byelalves@yaho.com.br'),
  BOOTSTRAP_LOGIN_PASSWORD: z.string().min(6).default('@Lu171100'),
  BOOTSTRAP_LOGIN_NAME: z.string().min(1).default('Byel Alves'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
