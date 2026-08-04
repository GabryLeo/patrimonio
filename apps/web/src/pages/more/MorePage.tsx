import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bell, CloudUpload, Download, Settings2, ShieldCheck, Users } from 'lucide-react'
import { CreateUserSchema, type CreateUserInput } from '@patrimonio/shared'
import { useUsers, useCreateUser, useDeleteUser } from '@/hooks/useUsers'
import { useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const moreItems = [
  { title: 'Perfil', description: 'Dados da conta e acesso atual', icon: ShieldCheck },
  { title: 'Exportação', description: 'Preparar saída de dados e relatórios', icon: Download },
  { title: 'Backup', description: 'Estruturar rotina de segurança', icon: CloudUpload },
  { title: 'Notificações', description: 'Lembretes e avisos futuros', icon: Bell },
  { title: 'Configurações gerais', description: 'Preferências do aplicativo', icon: Settings2 },
]

export default function MorePage() {
  const { data: users = [], isLoading } = useUsers()
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()
  const logout = useLogout()
  const currentUser = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)

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
    setOpen(false)
  }

  return (
    <div className="space-y-6 px-4 pb-6 pt-8">
      <div>
        <p className="text-sm text-muted-foreground">Ajustes e acesso</p>
        <h1 className="text-2xl font-bold">Mais</h1>
      </div>

      <section className="grid gap-3">
        {moreItems.map((item) => (
          <Card key={item.title} className="border-0 shadow-sm">
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
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Pessoas compartilhadas</h2>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
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
                  <Input placeholder="Ex: Luanny" {...register('name')} />
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
          {users.map((user) => (
            <Card key={user.id} className="border-0 shadow-sm">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                {user.id !== currentUser?.id ? (
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
    </div>
  )
}
