import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  useDocumentTitle('Not Found')

  return (
    <div className="container flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">Page not found.</p>
      <Button asChild className="mt-6">
        <Link to="/">Go Home</Link>
      </Button>
    </div>
  )
}
