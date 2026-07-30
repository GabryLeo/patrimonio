import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import { useUpload } from '@/hooks/useUpload'
import { formatDate, formatFileSize } from '@/lib/formatters'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Image, ExternalLink, Upload } from 'lucide-react'

export default function AssetDocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const upload = useUpload({ assetId: id })

  const photoRef = useRef<HTMLInputElement>(null)
  const docRef = useRef<HTMLInputElement>(null)

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
    await upload.mutateAsync(file)
    qc.invalidateQueries({ queryKey: ['documents', id] })
    qc.invalidateQueries({ queryKey: ['photos', id] })
    e.target.value = ''
  }

  return (
    <div className="px-4 pt-6 pb-6 space-y-8">
      {upload.isPending && (
        <div className="text-center text-sm text-muted-foreground py-2">Enviando arquivo...</div>
      )}
      {upload.isError && (
        <div className="text-center text-sm text-destructive py-2">Erro ao enviar arquivo. Tente novamente.</div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={docRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Photos */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Fotos</h2>
          <Button size="sm" variant="outline" onClick={() => photoRef.current?.click()} disabled={upload.isPending}>
            <Upload className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
        {photosLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : photos?.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo: any) => (
              <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer" className="aspect-square block">
                <img src={photo.url} alt={photo.name} className="w-full h-full object-cover rounded-xl" />
              </a>
            ))}
          </div>
        ) : (
          <button
            onClick={() => photoRef.current?.click()}
            className="w-full rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm hover:bg-accent transition-colors"
          >
            <Image className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Toque para adicionar fotos
          </button>
        )}
      </section>

      {/* Documents */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Documentos</h2>
          <Button size="sm" variant="outline" onClick={() => docRef.current?.click()} disabled={upload.isPending}>
            <Upload className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
        {docsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : docs?.length > 0 ? (
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
        ) : (
          <button
            onClick={() => docRef.current?.click()}
            className="w-full rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm hover:bg-accent transition-colors"
          >
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Toque para adicionar documentos
          </button>
        )}
      </section>
    </div>
  )
}
