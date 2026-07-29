# Patrimônio — Design Spec (V1)

**Data:** 2026-07-29  
**Escopo:** V1 — base funcional completa  
**Usuários:** 2 (acesso privado, casal)

---

## Filosofia

Não é um gerenciador de documentos nem um controle financeiro tradicional.  
É um **companheiro da construção do patrimônio** — cada registro conta um capítulo de uma história.  
Daqui a 10 anos, deve ser possível ver toda a evolução desde o primeiro dia.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19 + TypeScript + Vite |
| UI | Tailwind CSS v4 + shadcn/ui |
| Estado global | Zustand |
| Data fetching | TanStack Query v5 |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Banco | PostgreSQL (Neon) |
| Storage | Supabase Storage |
| Auth | JWT em httpOnly cookie |
| Deploy front | Vercel |
| Deploy API | Render |
| Validação | Zod (compartilhado via `packages/shared`) |
| Build | Turborepo |

---

## Estrutura do Monorepo

```
patrimonio/
├── apps/
│   ├── web/          # React + Vite
│   └── api/          # Express + Prisma
├── packages/
│   └── shared/       # Tipos TypeScript + schemas Zod
├── package.json      # npm workspaces
└── turbo.json
```

---

## Data Model

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  assets    Asset[]
}

model Asset {
  id              String          @id @default(cuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id])
  name            String
  type            AssetType
  description     String?
  coverImageUrl   String?
  totalValue      Decimal?
  acquisitionDate DateTime?
  status          AssetStatus     @default(ACTIVE)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  categories      AssetCategory[]
  financials      FinancialRecord[]
  memories        Memory[]
  checklists      Checklist[]
  attachments     Attachment[]
}

enum AssetType {
  APARTMENT HOUSE CAR LAND COMMERCIAL MOTORCYCLE BOAT OTHER
}

enum AssetStatus {
  ACTIVE SOLD ARCHIVED
}

model AssetCategory {
  id         String            @id @default(cuid())
  assetId    String
  asset      Asset             @relation(fields: [assetId], references: [id])
  name       String
  color      String
  icon       String?
  order      Int               @default(0)
  financials FinancialRecord[]
}

model FinancialRecord {
  id          String        @id @default(cuid())
  assetId     String
  asset       Asset         @relation(fields: [assetId], references: [id])
  categoryId  String?
  category    AssetCategory? @relation(fields: [categoryId], references: [id])
  title       String
  amount      Decimal
  eventDate   DateTime      // data real do evento (usada na timeline)
  createdAt   DateTime      @default(now()) // auditoria apenas
  notes       String?
  attachments Attachment[]
}

model Attachment {
  id                String           @id @default(cuid())
  assetId           String?
  asset             Asset?           @relation(fields: [assetId], references: [id])
  financialRecordId String?
  financialRecord   FinancialRecord? @relation(fields: [financialRecordId], references: [id])
  memoryId          String?
  memory            Memory?          @relation(fields: [memoryId], references: [id])
  url               String
  name              String
  size              Int
  mimeType          String
  type              AttachmentType
  createdAt         DateTime         @default(now())
}

enum AttachmentType {
  PDF IMAGE VIDEO AUDIO DOCUMENT
}

model Memory {
  id          String       @id @default(cuid())
  assetId     String
  asset       Asset        @relation(fields: [assetId], references: [id])
  title       String
  description String?
  eventDate   DateTime
  createdAt   DateTime     @default(now())
  attachments Attachment[]
}

model Checklist {
  id        String          @id @default(cuid())
  assetId   String
  asset     Asset           @relation(fields: [assetId], references: [id])
  title     String
  createdAt DateTime        @default(now())
  items     ChecklistItem[]
}

model ChecklistItem {
  id          String    @id @default(cuid())
  checklistId String
  checklist   Checklist @relation(fields: [checklistId], references: [id])
  title       String
  completed   Boolean   @default(false)
  order       Int       @default(0)
}
```

**Regra central:** `eventDate` posiciona o registro na timeline. `createdAt` vai apenas para auditoria — nunca aparece na UI. Registros retroativos são plenamente suportados.

---

## API — Rotas (V1)

```
# Auth
POST   /auth/login
POST   /auth/logout
GET    /auth/me

# Patrimônios
GET    /assets
POST   /assets
GET    /assets/:id
PUT    /assets/:id
DELETE /assets/:id

# Categorias
GET    /assets/:id/categories
POST   /assets/:id/categories
PUT    /assets/:id/categories/:categoryId
DELETE /assets/:id/categories/:categoryId

# Financeiro
GET    /assets/:id/financial
POST   /assets/:id/financial
GET    /assets/:id/financial/:recordId
PUT    /assets/:id/financial/:recordId
DELETE /assets/:id/financial/:recordId

# Timeline (agregada, somente leitura)
GET    /assets/:id/timeline

# Documentos / Fotos
GET    /assets/:id/documents
GET    /assets/:id/photos

# Memórias
GET    /assets/:id/memories
POST   /assets/:id/memories
PUT    /assets/:id/memories/:memoryId
DELETE /assets/:id/memories/:memoryId

# Upload
POST   /upload              → retorna presigned URL Supabase
DELETE /upload/:fileId

# Dashboard
GET    /dashboard/summary

# Relatórios
GET    /reports/:assetId/pdf
```

Todas as rotas protegidas por middleware JWT (httpOnly cookie), exceto `POST /auth/login`.

---

## Frontend — Estrutura

```
apps/web/src/
├── components/
│   ├── ui/                 shadcn (Button, Card, Dialog, Sheet, etc.)
│   └── shared/             AssetCard, TimelineItem, FileUpload,
│                           FinancialRecord, CategoryBadge, etc.
├── pages/
│   ├── auth/
│   │   └── Login.tsx
│   ├── dashboard/
│   │   └── Dashboard.tsx
│   └── assets/
│       ├── AssetList.tsx
│       └── [id]/
│           ├── AssetOverview.tsx
│           ├── financial/
│           ├── timeline/
│           ├── documents/
│           └── memories/
├── store/
│   ├── authStore.ts        Zustand
│   └── uiStore.ts
├── hooks/
│   ├── useAssets.ts        TanStack Query
│   ├── useFinancial.ts
│   ├── useTimeline.ts
│   └── useUpload.ts
└── lib/
    ├── apiClient.ts        axios com interceptor de cookie
    ├── cn.ts
    └── formatters.ts       moeda, data, tamanho de arquivo
```

---

## Navegação

**Mobile (bottom nav):**
```
🏠 Home | 📋 Patrimônios | ➕ Adicionar | 📁 Arquivos | ••• Mais
```

Botão ➕ central abre Sheet com opções:
- Pagamento / Registro financeiro
- Documento
- Foto
- Vídeo
- Memória
- Checklist

**Desktop:** sidebar esquerda + conteúdo principal. Mesmo fluxo, mais espaço para gráficos e comparações.

---

## Sistema de Categorias e Cores

Cada patrimônio tem categorias customizáveis com cor própria.

**Defaults para Apartamento:**
| Categoria | Cor |
|-----------|-----|
| Entrada | Azul |
| Parcelas | Verde |
| Financiamento | Roxo |
| Escritura | Cinza |
| ITBI | Cinza |
| Reforma | Vermelho |
| Móveis | Laranja |
| Decoração | Amarelo |

**Defaults para Carro:**
| Categoria | Cor |
|-----------|-----|
| Entrada | Azul |
| Parcelas | Verde |
| Seguro | Roxo |
| IPVA | Cinza |
| Manutenção | Laranja |
| Revisões | Verde escuro |

Cores aparecem em: gráficos, timeline, cards, badges, filtros.

---

## Timeline

Linha do tempo cronológica por `eventDate`.  
Agrupa registros financeiros, memórias e documentos em uma narrativa unificada.  
Auditoria de registro retroativo fica separada — nunca polui a timeline.

---

## Upload

Fluxo:
1. Client chama `POST /upload` com `filename` e `mimeType`
2. API gera presigned URL via Supabase Storage SDK
3. Client faz PUT direto no Supabase
4. Client confirma URL e salva no registro

Tipos aceitos: PDF, JPG, PNG, WEBP, HEIC, DOCX, XLSX, MP4, MOV, MP3, WAV.

---

## Segurança

- Senhas: bcrypt (salt rounds 12)
- JWT em httpOnly cookie (não acessível via JS)
- Rate limit: express-rate-limit nas rotas de auth
- Validação: Zod em todas as entradas de API
- CORS restrito às origens do Vercel

---

## Ordem de Build — V1

| Etapa | Entregável |
|-------|-----------|
| 1 | Scaffold monorepo (Turborepo + workspaces + shared) |
| 2 | Auth (login, JWT cookie, middleware, /auth/me) |
| 3 | Patrimônios CRUD + tipos + categorias padrão por tipo |
| 4 | Financeiro (registros + upload Supabase + anexos) |
| 5 | Timeline (agregação por eventDate) |
| 6 | Documentos + Fotos (galeria com zoom/fullscreen) |
| 7 | Dashboard (geral + por patrimônio) |
| 8 | Relatórios PDF |

---

## Fora do Escopo V1

- Vídeos / Áudios (V2)
- Comparativos anuais (V2)
- Exportação Excel / Backup completo (V2)
- Tema Dark (V2)
- Notificações / OCR / IA (V3)
- PWA offline (V3)
