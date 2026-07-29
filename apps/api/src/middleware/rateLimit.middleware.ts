import rateLimit from 'express-rate-limit'

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Muitos uploads. Aguarde um momento.' },
})
