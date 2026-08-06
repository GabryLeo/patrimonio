import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bell, CloudUpload, Download, Settings2, ShieldCheck, Users } from 'lucide-react'
import { CreateUserSchema, type CreateUserInput } from '@patrimonio/shared'
import { useUsers, useCreateUser, useDeleteUser } from '@/hooks/useUsers'
import { useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { useAssets } from '@/hooks/useAssets'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function normalizeEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  return normalized === 'byelalves@yaho.com.br' ? 'byelalves@yahoo.com.br' : normalized
}

const moreItems = [
  { title: 'Perfil', description: 'Dados da conta e acesso atual', icon: ShieldCheck },
  { title: 'Exportação', description: 'Preparar saída de dados e relatórios', icon: Download },
  { title: 'Backup', description: 'Estruturar rotina de segurança', icon: CloudUpload },
  { title: 'Notificações', description: 'Lembretes e avisos do app', icon: Bell },
  { title: 'Configurações gerais', description: 'Preferências do aplicativo', icon: Settings2 },
]

export default function MorePage() {
  const { data: users = [], isLoading } = useUsers()
  const { data: assets = [] } = useAssets()
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()
  const logout = useLogout()
  const currentUser = useAuthStore((s) => s.user)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [exportAssetId, setExportAssetId] = useState('all')
  const currentUserEmail = currentUser?.email ? normalizeEmail(currentUser.email) : null

  const visibleUsers = useMemo(() => {
    const byEmail = new Map<string, any>()
    for (const user of users) {
      const key = normalizeEmail(user.email)
      if (!byEmail.has(key)) {
        byEmail.set(key, { ...user, email: key })
      }
    }
    return Array.from(byEmail.values())
  }, [users])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
  })

  async function onSubmit(data: CreateUserInput) {
    await createUser.mutateAsync(data)
    reset()
    setShareDialogOpen(false)
  }

  return (
    <div className="space-y-6 px-4 pb-6 pt-8">
      <div>
        <p className="text-sm text-muted-foreground">Ajustes e acesso</p>
        <h1 className="text-2xl font-bold">Mais</h1>
      </div>

      <section className="grid gap-3">
        {moreItems.map((item) => (
          <button key={item.title} onClick={() => setActivePanel(item.title)} className="w-full text-left">
            <Card className="border-0 shadow-sm transition-transform hover:-translate-y-0.5">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Pessoas compartilhadas</h2>
          </div>
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">Adicionar</Button>
            </DialogTrigger>
            <DialogContent className="mx-4 w-[calc(100vw-2rem)] max-w-sm">
              <DialogHeader>
                <DialogTitle>Adicionar pessoa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
                <div className="space-y-1">
                  <Label>Nome</Label>
                  <Input placeholder="Ex: Hellen" {...register('name')} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" placeholder="email@exemplo.com" {...register('email')} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Senha</Label>
                  <Input type="password" placeholder="Mínimo 6 caracteres" {...register('password')} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
                {createUser.error && <p className="text-center text-xs text-destructive">Erro ao criar acesso</p>}
                <Button type="submit" className="w-full" disabled={createUser.isPending}>
                  {createUser.isPending ? 'Criando...' : 'Criar acesso'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {visibleUsers.map((user) => (
            <Card key={user.id} className="border-0 shadow-sm">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                {normalizeEmail(user.email) !== currentUserEmail ? (
                  <button onClick={() => deleteUser.mutate(user.id)} className="text-xs font-medium text-destructive">
                    Remover
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">Você</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Button variant="outline" className="w-full border-destructive/30 text-destructive" onClick={() => logout.mutate()}>
        Sair
      </Button>

      <Dialog open={!!activePanel} onOpenChange={(open) => (!open ? setActivePanel(null) : undefined)}>
        <DialogContent className="mx-4 w-[calc(100vw-2rem)] max-w-lg">
          <DialogHeader>
            <DialogTitle>{activePanel}</DialogTitle>
          </DialogHeader>
          {activePanel === 'Perfil' && (
            <div className="space-y-3 text-sm">
              <InfoRow label="Nome" value={currentUser?.name ?? '—'} />
              <InfoRow label="E-mail" value={currentUser?.email ?? '—'} />
              <InfoRow label="Conta compartilhada" value="Ativa entre pessoas autorizadas" />
              <p className="text-xs text-muted-foreground">
                A edição de senha e dados básicos segue como próximo passo do app, mas esta tela já mostra o contexto real da conta.
              </p>
            </div>
          )}
          {activePanel === 'Exportação' && (
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">Escolha o escopo da exportação que você quer preparar.</p>
              <div className="space-y-2">
                <Label>Patrimônio</Label>
                <Select value={exportAssetId} onValueChange={setExportAssetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um patrimônio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os dados</SelectItem>
                    {assets.map((asset: any) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                Formatos planejados: PDF, CSV e pacote completo com arquivos. Neste momento, a tela orienta o escopo antes da geração.
              </div>
            </div>
          )}
          {activePanel === 'Backup' && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">O backup do app foi separado da exportação, como pede o briefing.</p>
              <InfoRow label="Backup automático na nuvem" value="Estrutura prevista para restauração segura" />
              <InfoRow label="Cópia externa manual" value="Planejada como pacote ZIP com dados e arquivos" />
              <div className="rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                Próximo passo técnico: conectar geração e restauração. A tela já deixa claro o papel do backup e evita botão sem contexto.
              </div>
            </div>
          )}
          {activePanel === 'Notificações' && (
            <div className="space-y-3 text-sm">
              <InfoRow label="Confirmações internas" value="Salvar, upload, memória e erros importantes" />
              <InfoRow label="Relatório semestral" value="Preparado para envio por e-mail a cada 6 meses" />
              <div className="rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                Esta área é exclusiva para avisos do próprio app, sem misturar alertas bancários ou segurança externa.
              </div>
            </div>
          )}
          {activePanel === 'Configurações gerais' && (
            <div className="space-y-3 text-sm">
              <InfoRow label="Tema" value="Claro / escuro / automático" />
              <InfoRow label="Moeda" value="BRL" />
              <InfoRow label="Data" value="dd/mm/aaaa" />
              <InfoRow label="Confirmação antes de excluir" value="Recomendada para manter segurança" />
              <div className="rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                Essas preferências afetam a experiência do app sem alterar os dados estruturais.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}
