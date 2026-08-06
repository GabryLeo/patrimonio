export function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''

  const numericValue = Number(digits) / 100
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)
}

export function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 0
  return Number(digits) / 100
}
