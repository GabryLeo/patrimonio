export interface FinancialRecord {
  id: string
  assetId: string
  categoryId?: string
  category?: {
    id: string
    name: string
    color: string
    icon?: string
  }
  title: string
  amount: number
  eventDate: string
  createdAt: string
  notes?: string
  attachments?: Attachment[]
}

export interface Attachment {
  id: string
  url: string
  name: string
  size: number
  mimeType: string
  type: 'PDF' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT'
  createdAt: string
}

export interface Memory {
  id: string
  assetId: string
  title: string
  description?: string
  eventDate: string
  createdAt: string
  attachments?: Attachment[]
}

export interface TimelineEvent {
  id: string
  type: 'FINANCIAL' | 'MEMORY' | 'DOCUMENT'
  title: string
  description?: string
  amount?: number
  eventDate: string
  category?: {
    name: string
    color: string
  }
  attachments?: Attachment[]
}
