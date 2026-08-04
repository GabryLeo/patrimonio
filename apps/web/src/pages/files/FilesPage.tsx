import { useMemo, useState } from 'react'
import { Download, Eye, FileImage, FileText, Search } from 'lucide-react'
import { useGlobalFiles } from '@/hooks/useDashboard'
import { formatDate, formatFileSize } from '@/lib/formatters'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const typeOptions = [
  { value: 'all', label: 'Todos arquivos' },
  { value: 'PDF', label: 'PDF' },
  { value: 'IMAGE', label: 'Imagem' },
  { value: 'contract', label: 'Contrato' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'recibo', label: 'Recibo' },
]

export default function FilesPage() {
  const { data, isLoading } = useGlobalFiles()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')

  const files = data?.files ?? []

  const filtered = useMemo(
    () =>
      files.filter((file: any) => {
        const matchesName = file.name.toLowerCase().includes(query.toLowerCase())
        const matchesType = type === 'all' || file.type === type || file.kind === type
        return matchesName && matchesType
      }),
    [files, query, type]
  )

  return (
    <div className="space-y-6 px-4 pb-6 pt-8">
      <div>
        <p className="text-sm text-muted-foreground">Central única</p>
        <h1 className="text-2xl font-bold">Arquivos</h1>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar por nome" className="pl-9" />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de arquivo" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => <Skeleton key={item} className="h-20" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum arquivo encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((file: any) => (
            <Card key={file.id} className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                  {file.type === 'IMAGE' ? <FileImage className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.asset?.name ?? 'Sem patrimônio'} • {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{file.sourceTitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={file.url} target="_blank" rel="noreferrer" className="rounded-xl border p-2 text-muted-foreground transition-colors hover:text-foreground">
                    <Eye className="h-4 w-4" />
                  </a>
                  <a href={file.url} download className="rounded-xl border p-2 text-muted-foreground transition-colors hover:text-foreground">
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
