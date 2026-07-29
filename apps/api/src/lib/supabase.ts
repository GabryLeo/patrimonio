import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

export const BUCKET = env.SUPABASE_BUCKET
