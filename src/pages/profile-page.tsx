import { useAuth } from '@/lib/auth-context'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { Button } from '@/components/ui/button'
import { ShieldAlert, User, LogOut } from 'lucide-react'

export default function ProfilePage() {
  useDocumentTitle('Profile')
  const { isAuthenticated, user, logout } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="container max-w-7xl mx-auto py-24 flex items-center justify-center">
        <div className="glass-panel border-primary/30 bg-primary/5 rounded-3xl p-12 inline-flex flex-col items-center gap-6 text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-primary animate-pulse" />
          <h2 className="text-3xl font-black tracking-tight text-white">Access Denied</h2>
          <p className="text-muted-foreground font-mono text-sm">
            Authentication required to view profile records. Please sign in to proceed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-16 px-6 space-y-12">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Agent Profile</h1>
        </div>
        <p className="text-muted-foreground font-mono text-sm">
          Identity and credentials record.
        </p>
      </div>
      
      <div className="glass-panel rounded-3xl p-8 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <User className="w-48 h-48" />
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <img 
              src={user?.avatar || 'https://www.gravatar.com/avatar/?d=identicon'} 
              alt="Avatar" 
              className="relative w-32 h-32 rounded-full border-2 border-primary p-1 bg-black object-cover"
            />
          </div>
          
          <div className="text-center sm:text-left space-y-2 mt-4">
            <h2 className="text-3xl font-black tracking-tight text-white">{user?.username}</h2>
            <p className="text-accent font-mono text-sm">{user?.email || 'NO_EMAIL_RECORDED'}</p>
            <div className="inline-block mt-2 px-2 py-1 rounded bg-white/10 text-xs font-mono text-muted-foreground border border-white/10">
              STATUS: ACTIVE
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 pt-8 border-t border-white/10 relative z-10">
          <div className="space-y-1 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="text-xs font-mono text-muted-foreground">First Name</div>
            <div className="text-lg font-medium text-white/90">{user?.firstName || '—'}</div>
          </div>
          <div className="space-y-1 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="text-xs font-mono text-muted-foreground">Last Name</div>
            <div className="text-lg font-medium text-white/90">{user?.lastName || '—'}</div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 relative z-10 flex justify-end">
          <Button 
            variant="destructive" 
            onClick={logout}
            className="font-mono rounded-xl gap-2 shadow-[0_0_15px_hsl(var(--destructive)/0.3)] hover:shadow-[0_0_20px_hsl(var(--destructive)/0.6)]"
          >
            <LogOut className="w-4 h-4" /> DISCONNECT
          </Button>
        </div>
      </div>
    </div>
  )
}