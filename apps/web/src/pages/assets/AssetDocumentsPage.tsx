import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import { useUpload } from '@/hooks/useUpload'
import { formatDate, formatFileSize } from '@/lib/formatters'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, ExternalLink, Upload, X } from 'lucide-react'

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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await upload.mutateAsync({ file })
    qc.invalidateQueries({ queryKey: ['documents', id] })
    qc.invalidateQueries({ queryKey: ['photos', id] })
    e.target.value = ''
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
      {upload.isPending && (
        <div className="text-center text-sm text-muted-foreground py-2 mb-2">Enviando arquivo...</div>
      )}
      {upload.isError && (
        <div className="text-center text-sm text-destructive py-2 mb-2">Erro ao enviar. Tente novamente.</div>
      )}

      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Arquivos</h2>
        {!showTypeSelector && (
          <Button size="sm" variant="outline" onClick={() => setShowTypeSelector(true)} disabled={upload.isPending}>
            <Upload className="h-4 w-4 mr-1" />
            Adicionar arquivo
          </Button>
        )}
      </div>

      {showTypeSelector && (
        <div className="mb-4 p-3 border rounded-xl bg-secondary/50">
          <div className="flex items-center justify-between mb-2">
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
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-background transition-colors text-center"
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
                <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer" className="aspect-square block">
                  <img src={photo.url} alt={photo.name} className="w-full h-full object-cover rounded-xl" />
                </a>
              ))}
            </div>
          )}
          {(docs?.length ?? 0) > 0 && (
            <div className="space-y-2">
              {docs.map((doc: any) => (
                <Card key={doc.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)} · {formatDate(doc.createdAt)}</p>
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
          className="w-full rounded-xl border border-dashed p-8 text-center text-muted-foreground text-sm hover:bg-accent transition-colors"
        >
          <Upload className="h-8 w-8 mx-auto mb-2 opacity-30" />
          Toque para adicionar arquivos
        </button>
      )}
    </div>
  )
}
