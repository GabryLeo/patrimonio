# Patrimônio V1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Plataforma web full-stack para gerenciamento de patrimônio pessoal — monorepo com API Express + frontend React.

**Architecture:** Turborepo monorepo (`apps/api`, `apps/web`, `packages/shared`). Vertical slices — cada tarefa entrega BE + FE de uma feature funcional. JWT em httpOnly cookie. Upload via presigned URL do Supabase Storage.

**Tech Stack:** React 19 · Vite · Tailwind CSS v3 · shadcn/ui · TanStack Query · Zustand · Node.js · Express · Prisma · PostgreSQL (Neon) · Supabase Storage · JWT · Turborepo

## Global Constraints

- Node.js ≥ 20
- TypeScript strict mode em todos os workspaces
- Zod para validação (compartilhado via `@patrimonio/shared`)
- JWT em httpOnly cookie (nunca localStorage)
- `eventDate` determina posição na timeline; `createdAt` é auditoria apenas
- Mobile-first; bottom navigation com 5 tabs
- Todos os valores monetários como `Decimal` no Prisma / `number` no JS
- Env vars: `DATABASE_URL`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_BUCKET`, `CLIENT_URL`, `PORT`

---

## Status da Implementação (V1 Completo)

### ✅ Task 1: Monorepo Scaffold
- Turborepo + npm workspaces
- `packages/shared` com tipos e schemas Zod
- `apps/api` com Express + Prisma + middleware
- `apps/web` com Vite + React + Tailwind

### ✅ Task 2: Shared Types & Schemas
- `auth.types.ts`, `asset.types.ts`, `financial.types.ts`, `attachment.types.ts`
- `auth.schema.ts`, `asset.schema.ts`, `financial.schema.ts`
- `DEFAULT_CATEGORIES` por tipo de patrimônio
- `ASSET_TYPE_LABELS` para UI

### ✅ Task 3: Database Schema
- Modelos: User, Asset, AssetCategory, FinancialRecord, Attachment, Memory, Checklist, ChecklistItem
- Enums: AssetType, AssetStatus, AttachmentType
- Prisma client gerado

### ✅ Task 4: API Foundation
- Express + CORS + cookie-parser
- Middleware: auth (JWT), error handler, rate limiter
- Health check: `GET /health`

### ✅ Task 5: Auth Backend + Frontend
- `POST /api/auth/login` — valida credenciais, seta cookie JWT
- `POST /api/auth/logout` — limpa cookie
- `GET /api/auth/me` — retorna usuário autenticado
- Frontend: LoginPage com react-hook-form + Zod
- Hooks: `useLogin`, `useLogout`, `useMe`
- Store: `authStore` (Zustand + persist)

### ✅ Task 6: Assets + Categories Backend + Frontend
- CRUD completo de patrimônios (`/api/assets`)
- Categorias automáticas por tipo na criação
- CRUD de categorias (`/api/assets/:id/categories`)
- Frontend: AssetsListPage + AssetsOverviewPage + dialog de criação

### ✅ Task 7: Financial Records Backend + Frontend
- CRUD de registros financeiros (`/api/assets/:id/financial`)
- Frontend: AssetFinancialPage com form completo + cores de categoria

### ✅ Task 8: Upload Service
- `POST /api/upload/presign` — gera presigned URL Supabase
- `POST /api/upload/confirm` — salva Attachment no banco
- `DELETE /api/upload/:fileId` — remove com verificação de ownership
- Hook `useUpload` no frontend

### ✅ Task 9: Timeline Backend + Frontend
- `GET /api/assets/:id/timeline` — agrega financials + memories por eventDate
- Frontend: AssetTimelinePage agrupada por mês com linha vertical

### ✅ Task 10: Documents + Photos Backend + Frontend
- `GET /api/assets/:id/documents` — PDFs e DOCXs
- `GET /api/assets/:id/photos` — imagens
- Frontend: AssetDocumentsPage com galeria grid + lista de docs

### ✅ Task 11: Memories Backend
- CRUD de memórias (`/api/assets/:id/memories`)

### ✅ Task 12: Dashboard Backend + Frontend
- `GET /api/dashboard/summary` — total investido, bens, mês, próximos pagamentos
- Frontend: DashboardPage com cards, lista de bens, próximos pagamentos

### ✅ Task 13: Reports Backend
- `GET /api/reports/:assetId/pdf` — retorna HTML como buffer (PDF em V2 com puppeteer)

### ✅ Task 14: Navigation + Layout
- BottomNav com 5 tabs (Home, Patrimônios, +, Arquivos, Mais)
- AddSheet — bottom sheet com opções de adicionar
- AppLayout com Outlet

---

## Próximos Passos para Rodar

1. Copiar `apps/api/.env` e preencher `DATABASE_URL` (Neon), `JWT_SECRET`, Supabase keys
2. Rodar `npx prisma migrate dev --name init` em `apps/api/`
3. Rodar `npx tsx prisma/seed.ts` em `apps/api/` para criar o usuário admin
4. Rodar `npm run dev` na raiz para subir API (porta 3001) + Web (porta 5173)

---

## Roadmap V2

- Vídeos e Áudios
- Comparativos anuais
- Exportação Excel / Backup completo
- Tema Dark
- Checklists frontend

## Roadmap V3

- Notificações
- OCR para documentos
- IA para organizar arquivos
- PWA offline
