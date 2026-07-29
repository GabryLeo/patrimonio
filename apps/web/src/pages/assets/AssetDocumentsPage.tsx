import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import { formatDate, formatFileSize } from '@/lib/formatters'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Image, ExternalLink } from 'lucide-react'

export default function AssetDocumentsPage() {
  const { id } = useParams<{ id: string }>()

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

  return (
    <div className="px-4 pt-6 pb-6 space-y-8">
      {/* Photos */}
      <section>
        <h2 className="text-lg font-bold mb-4">Fotos</h2>
        {photosLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : photos?.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo: any) => (
              <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer" className="aspect-square">
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </a>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              <Image className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Nenhuma foto ainda
            </CardContent>
          </Card>
        )}
      </section>

      {/* Documents */}
      <section>
        <h2 className="text-lg font-bold mb-4">Documentos</h2>
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
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Nenhum documento ainda
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
