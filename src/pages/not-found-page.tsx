import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { Button } from '@/components/ui/button'
import { ServerCrash } from 'lucide-react'

export default function NotFoundPage() {
  useDocumentTitle('Not Found')

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-panel border-primary/30 bg-primary/5 rounded-3xl p-12 inline-flex flex-col items-center gap-6 max-w-lg relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] font-black text-white/[0.02] pointer-events-none select-none">
          404
        </div>
        
        <ServerCrash className="w-20 h-20 text-primary relative z-10" />
        
        <div className="space-y-2 relative z-10">
          <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]">
            SYS_404
          </h1>
          <p className="text-lg text-muted-foreground font-mono uppercase tracking-wider">
            Sector Not Found
          </p>
        </div>
        
        <p className="text-sm text-muted-foreground/80 max-w-xs relative z-10">
          The requested coordinate does not exist within the current database directory.
        </p>

        <Button asChild className="mt-4 font-mono uppercase tracking-wider rounded-xl shadow-[0_0_15px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.6)] relative z-10">
          <Link to="/">Initialize Reboot</Link>
        </Button>
      </div>
    </div>
  )
}