import { useAuth } from '@/lib/auth-context'
import { useDocumentTitle } from '@/hooks/use-document-title'

export default function TimelinePage() {
  useDocumentTitle('Timeline')
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <p>Please sign in to view the timeline page.</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Timeline</h1>
      <p className="mt-2 text-muted-foreground">Coming soon.</p>
    </div>
  )
}
