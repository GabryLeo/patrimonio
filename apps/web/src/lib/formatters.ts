import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr: string, pattern = 'dd/MM/yyyy'): string {
  try {
    // Date-only strings (YYYY-MM-DD) get noon UTC to prevent timezone day shift
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr + 'T12:00:00' : dateStr
    return format(parseISO(normalized), pattern, { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function formatMonth(dateStr: string): string {
  try {
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr + 'T12:00:00' : dateStr
    return format(parseISO(normalized), 'MMMM yyyy', { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
