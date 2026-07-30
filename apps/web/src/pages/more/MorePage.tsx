import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateUserSchema, type CreateUserInput } from '@patrimonio/shared'
import { useUsers, useCreateUser, useDeleteUser } from '@/hooks/useUsers'
import { useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

export default function MorePage() {
  const { data: users = [], isLoading } = useUsers()
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()
  const logout = useLogout()
  const currentUser = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
  })

  async function onSubmit(data: CreateUserInput) {
    try {
      await createUser.mutateAsync(data)
      reset()
      setOpen(false)
    } catch {
      // handled by createUser.error
    }
  }

  return (
    <div className="px-4 pt-8 pb-4">
      <h1 className="text-xl font-bold mb-6">Mais</h1>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pessoas com acesso</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">+ Adicionar</Button>
            </DialogTrigger>
            <DialogContent className="mx-4 w-[calc(100vw-2rem)] max-w-sm">
              <DialogHeader>
                <DialogTitle>Adicionar pessoa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
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
                {createUser.error && (
                  <p className="text-xs text-destructive text-center">Email já cadastrado ou erro ao criar</p>
                )}
                <Button type="submit" className="w-full" disabled={createUser.isPending}>
                  {createUser.isPending ? 'Criando...' : 'Criar acesso'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
              <div>
                <p className="font-medium text-sm">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              {u.id !== currentUser?.id && (
                <button
                  onClick={() => deleteUser.mutate(u.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/30"
          onClick={() => logout.mutate()}
        >
          Sair
        </Button>
      </section>
    </div>
  )
}
