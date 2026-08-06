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
  const [assetId, setAssetId] = useState('all')

  const files = data?.files ?? []
  const assets = useMemo(
    () => Array.from(new Map(files.filter((file: any) => file.asset).map((file: any) => [file.asset.id, file.asset])).values()),
    [files],
  )

  const filtered = useMemo(
    () =>
      files.filter((file: any) => {
        const matchesName = file.name.toLowerCase().includes(query.toLowerCase())
        const matchesType = type === 'all' || file.type === type || file.kind === type
        const matchesAsset = assetId === 'all' || file.asset?.id === assetId
        return matchesName && matchesType && matchesAsset
      }),
    [assetId, files, query, type],
  )

  const grouped = useMemo(
    () =>
      filtered.reduce((acc: Record<string, any[]>, file: any) => {
        const key = file.asset?.id ?? 'unknown'
        if (!acc[key]) acc[key] = []
        acc[key].push(file)
        return acc
      }, {}),
    [filtered],
  )

  return (
    <div className="space-y-6 px-4 pb-6 pt-8">
      <div>
        <p className="text-sm text-muted-foreground">Acesso rápido por patrimônio</p>
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
          <Select value={assetId} onValueChange={setAssetId}>
            <SelectTrigger>
              <SelectValue placeholder="Patrimônio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos patrimônios</SelectItem>
              {assets.map((asset: any) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.name}
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
        <div className="space-y-5">
          {(Object.entries(grouped) as Array<[string, any[]]>).map(([groupKey, groupFiles]) => (
            <section key={groupKey} className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{groupFiles[0]?.asset?.name ?? 'Sem patrimônio'}</h2>
                <span className="text-xs text-muted-foreground">{groupFiles.length} arquivo(s)</span>
              </div>
              {groupFiles.map((file: any) => (
                <Card key={file.id} className="border-0 shadow-sm">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                      {file.type === 'IMAGE' ? <FileImage className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {formatDate(file.createdAt)}
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
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
