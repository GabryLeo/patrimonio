export type AssetType = 'APARTMENT' | 'HOUSE' | 'CAR' | 'LAND' | 'COMMERCIAL' | 'MOTORCYCLE' | 'BOAT' | 'OTHER'
export type AssetStatus = 'ACTIVE' | 'SOLD' | 'ARCHIVED'

export interface Asset {
  id: string
  userId: string
  name: string
  type: AssetType
  description?: string
  coverImageUrl?: string
  totalValue?: number
  acquisitionDate?: string
  status: AssetStatus
  createdAt: string
  updatedAt: string
  categories?: AssetCategory[]
}

export interface AssetCategory {
  id: string
  assetId: string
  name: string
  color: string
  icon?: string
  order: number
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  APARTMENT: 'Apartamento',
  HOUSE: 'Casa',
  CAR: 'Carro',
  LAND: 'Terreno',
  COMMERCIAL: 'Sala Comercial',
  MOTORCYCLE: 'Moto',
  BOAT: 'Embarcação',
  OTHER: 'Outro',
}

export const DEFAULT_CATEGORIES: Record<AssetType, Array<{ name: string; color: string; icon: string }>> = {
  APARTMENT: [
    { name: 'Entrada', color: '#3B82F6', icon: 'home' },
    { name: 'Parcelas', color: '#22C55E', icon: 'credit-card' },
    { name: 'Financiamento', color: '#8B5CF6', icon: 'bank' },
    { name: 'Escritura', color: '#6B7280', icon: 'file-text' },
    { name: 'ITBI', color: '#6B7280', icon: 'receipt' },
    { name: 'Reforma', color: '#EF4444', icon: 'hammer' },
    { name: 'Móveis', color: '#F97316', icon: 'armchair' },
    { name: 'Decoração', color: '#EAB308', icon: 'palette' },
    { name: 'Condomínio', color: '#14B8A6', icon: 'building' },
    { name: 'Eletrodomésticos', color: '#06B6D4', icon: 'zap' },
  ],
  HOUSE: [
    { name: 'Entrada', color: '#3B82F6', icon: 'home' },
    { name: 'Parcelas', color: '#22C55E', icon: 'credit-card' },
    { name: 'Financiamento', color: '#8B5CF6', icon: 'bank' },
    { name: 'IPTU', color: '#6B7280', icon: 'receipt' },
    { name: 'Reforma', color: '#EF4444', icon: 'hammer' },
    { name: 'Móveis', color: '#F97316', icon: 'armchair' },
    { name: 'Manutenção', color: '#EAB308', icon: 'wrench' },
  ],
  CAR: [
    { name: 'Entrada', color: '#3B82F6', icon: 'car' },
    { name: 'Parcelas', color: '#22C55E', icon: 'credit-card' },
    { name: 'Seguro', color: '#8B5CF6', icon: 'shield' },
    { name: 'IPVA', color: '#6B7280', icon: 'receipt' },
    { name: 'Licenciamento', color: '#6B7280', icon: 'file-text' },
    { name: 'Manutenção', color: '#F97316', icon: 'wrench' },
    { name: 'Combustível', color: '#EAB308', icon: 'fuel' },
    { name: 'Revisões', color: '#14B8A6', icon: 'settings' },
  ],
  LAND: [
    { name: 'Entrada', color: '#3B82F6', icon: 'map' },
    { name: 'Parcelas', color: '#22C55E', icon: 'credit-card' },
    { name: 'Escritura', color: '#6B7280', icon: 'file-text' },
    { name: 'ITBI', color: '#6B7280', icon: 'receipt' },
    { name: 'IPTU', color: '#6B7280', icon: 'receipt' },
  ],
  COMMERCIAL: [
    { name: 'Entrada', color: '#3B82F6', icon: 'building-2' },
    { name: 'Parcelas', color: '#22C55E', icon: 'credit-card' },
    { name: 'Condomínio', color: '#14B8A6', icon: 'building' },
    { name: 'Reforma', color: '#EF4444', icon: 'hammer' },
    { name: 'IPTU', color: '#6B7280', icon: 'receipt' },
  ],
  MOTORCYCLE: [
    { name: 'Entrada', color: '#3B82F6', icon: 'bike' },
    { name: 'Parcelas', color: '#22C55E', icon: 'credit-card' },
    { name: 'Seguro', color: '#8B5CF6', icon: 'shield' },
    { name: 'Manutenção', color: '#F97316', icon: 'wrench' },
    { name: 'Combustível', color: '#EAB308', icon: 'fuel' },
  ],
  BOAT: [
    { name: 'Entrada', color: '#3B82F6', icon: 'anchor' },
    { name: 'Parcelas', color: '#22C55E', icon: 'credit-card' },
    { name: 'Seguro', color: '#8B5CF6', icon: 'shield' },
    { name: 'Manutenção', color: '#F97316', icon: 'wrench' },
    { name: 'Atracação', color: '#14B8A6', icon: 'anchor' },
  ],
  OTHER: [
    { name: 'Aquisição', color: '#3B82F6', icon: 'package' },
    { name: 'Manutenção', color: '#F97316', icon: 'wrench' },
    { name: 'Outros', color: '#6B7280', icon: 'more-horizontal' },
  ],
}
