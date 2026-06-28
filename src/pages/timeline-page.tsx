import { useAuth } from '@/lib/auth-context'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { History, ShieldAlert } from 'lucide-react'

export default function TimelinePage() {
  useDocumentTitle('Timeline')
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="container max-w-7xl mx-auto py-24 flex items-center justify-center">
        <div className="glass-panel border-primary/30 bg-primary/5 rounded-3xl p-12 inline-flex flex-col items-center gap-6 text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-primary animate-pulse" />
          <h2 className="text-3xl font-black tracking-tight text-white">Access Denied</h2>
          <p className="text-muted-foreground font-mono text-sm">
            Authentication required to view timeline records. Please sign in to proceed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto py-24 flex items-center justify-center">
      <div className="glass-panel rounded-3xl p-12 inline-flex flex-col items-center gap-6 text-center max-w-md border-accent/30 bg-accent/5">
        <History className="w-16 h-16 text-accent opacity-50" />
        <h2 className="text-3xl font-black tracking-tight text-white">System Timeline</h2>
        <p className="text-muted-foreground font-mono text-sm">
          Module currently under construction. Please check back later.
        </p>
        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-accent animate-ping"></div>
          <div className="w-2 h-2 rounded-full bg-accent animate-ping delay-100"></div>
          <div className="w-2 h-2 rounded-full bg-accent animate-ping delay-200"></div>
        </div>
      </div>
    </div>
  )
}