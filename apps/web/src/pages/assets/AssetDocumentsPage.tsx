import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import { useUpload } from '@/hooks/useUpload'
import { formatDate, formatFileSize, prettifyFileName } from '@/lib/formatters'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, ExternalLink, Upload, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type FileTypeConfig = { label: string; emoji: string; accept: string }

const FILE_TYPES: FileTypeConfig[] = [
  { label: 'Recibo', emoji: '📄', accept: '*/*' },
  { label: 'Contrato', emoji: '📋', accept: '*/*' },
  { label: 'Foto', emoji: '📷', accept: 'image/*,video/*' },
  { label: 'Vídeo', emoji: '🎥', accept: 'image/*,video/*' },
  { label: 'Outro', emoji: '📁', accept: '*/*' },
]

export default function AssetDocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const upload = useUpload({ assetId: id })
  const fileRef = useRef<HTMLInputElement>(null)
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [customName, setCustomName] = useState('')

  const { data: docs, isLoading: docsLoading } = useQuery({
    queryKey: ['documents', id],
    queryFn: async () => {
      const { data } = await api.get(`/assets/${id}/documents`)
      return data.documents
    },
    enabled: !!id,
  })

  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['photos', id],
    queryFn: async () => {
      const { data } = await api.get(`/assets/${id}/photos`)
      return data.photos
    },
    enabled: !!id,
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setCustomName(file.name)
    e.target.value = ''
  }

  async function handleConfirmUpload() {
    if (!selectedFile) return
    await upload.mutateAsync({ file: selectedFile, name: customName })
    qc.invalidateQueries({ queryKey: ['documents', id] })
    qc.invalidateQueries({ queryKey: ['photos', id] })
    setSelectedFile(null)
    setCustomName('')
  }

  function handleTypeSelect(config: FileTypeConfig) {
    if (fileRef.current) {
      fileRef.current.accept = config.accept
      setShowTypeSelector(false)
      fileRef.current.click()
    }
  }

  const isLoading = docsLoading || photosLoading
  const hasFiles = (photos?.length ?? 0) > 0 || (docs?.length ?? 0) > 0

  return (
    <div className="px-4 pt-6 pb-6">
      {upload.isPending && <div className="mb-2 py-2 text-center text-sm text-muted-foreground">Enviando arquivo...</div>}
      {upload.isError && <div className="mb-2 py-2 text-center text-sm text-destructive">Erro ao enviar. Tente novamente.</div>}

      <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />

      <div className="mb-2">
        <p className="text-sm text-muted-foreground">Arquivos deste patrimônio</p>
        <h2 className="text-lg font-bold">Arquivos</h2>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Cada arquivo fica vinculado a este patrimônio.</p>
        {!showTypeSelector && (
          <Button size="sm" variant="outline" onClick={() => setShowTypeSelector(true)} disabled={upload.isPending}>
            <Upload className="mr-1 h-4 w-4" />
            Adicionar arquivo
          </Button>
        )}
      </div>

      {showTypeSelector && (
        <div className="mb-4 rounded-xl border bg-secondary/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Tipo de arquivo</p>
            <button onClick={() => setShowTypeSelector(false)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {FILE_TYPES.map((ft) => (
              <button
                key={ft.label}
                onClick={() => handleTypeSelect(ft)}
                className="flex flex-col items-center gap-1 rounded-lg p-2 text-center transition-colors hover:bg-background"
              >
                <span className="text-xl">{ft.emoji}</span>
                <span className="text-xs text-muted-foreground">{ft.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        </div>
      ) : hasFiles ? (
        <div className="space-y-6">
          {(photos?.length ?? 0) > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo: any) => (
                <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer" className="block aspect-square">
                  <img src={photo.url} alt={photo.name} className="h-full w-full rounded-xl object-cover" />
                </a>
              ))}
            </div>
          )}
          {(docs?.length ?? 0) > 0 && (
            <div className="space-y-2">
              {docs.map((doc: any) => (
                <Card key={doc.id}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <FileText className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{prettifyFileName(doc.name)}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)} • {formatDate(doc.createdAt)}</p>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowTypeSelector(true)}
          className="w-full rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground transition-colors hover:bg-accent"
        >
          <Upload className="mx-auto mb-2 h-8 w-8 opacity-30" />
          Este patrimônio ainda não tem arquivos. Toque para adicionar o primeiro.
        </button>
      )}

      <Dialog open={!!selectedFile} onOpenChange={(open) => (!open ? setSelectedFile(null) : undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear arquivo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Edite o nome antes de finalizar o envio.</p>
            <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Nome do arquivo" />
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setSelectedFile(null)}>
                Cancelar
              </Button>
              <Button type="button" className="flex-1" onClick={handleConfirmUpload} disabled={!customName.trim() || upload.isPending}>
                {upload.isPending ? 'Enviando...' : 'Salvar arquivo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
