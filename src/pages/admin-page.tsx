import { useState } from 'react'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gameService, type UserMapping } from '@/lib/game-service'
import { copyToClipboard } from '@/lib/clipboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Copy, ShieldCheck, AlertOctagon, Terminal } from 'lucide-react'

export default function AdminPage() {
  useDocumentTitle('Admin')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // User Mappings State
  const [mappingForm, setMappingForm] = useState<UserMapping>({ steamId: '', username: '', nickname: '', discordId: '' })
  const [steamIdsInput, setSteamIdsInput] = useState('')
  const [appIdsInput, setAppIdsInput] = useState('')

  const { data: userMappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ['user-mappings'],
    queryFn: () => gameService.getUserMappings(),
  })

  const addMappingMutation = useMutation({
    mutationFn: (data: UserMapping) => gameService.addOrUpdateUserMapping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-mappings'] })
      toast({ title: 'Success', description: 'User mapping updated.' })
      setMappingForm({ steamId: '', username: '', nickname: '', discordId: '' })
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  })

  const handleMappingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mappingForm.steamId || !mappingForm.username) return
    addMappingMutation.mutate(mappingForm)
  }

  return (
    <div className="container max-w-7xl mx-auto py-12 px-6 space-y-10">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-destructive/20 text-destructive rounded-xl animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Admin Console</h1>
        </div>
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">
          Warning: Authorized personnel only. System overrides active.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* User Mapping Form */}
        <div className="glass-panel rounded-3xl p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-mono text-primary flex items-center gap-2">
              <Terminal className="w-5 h-5" /> IDENTITY_MAPPING
            </h2>
            <p className="text-sm text-muted-foreground">Link Steam IDs to Usernames in the network.</p>
          </div>
          
          <form onSubmit={handleMappingSubmit} className="space-y-4">
            <div className="space-y-4">
              <Input
                placeholder="Steam ID *"
                required
                value={mappingForm.steamId}
                onChange={(e) => setMappingForm({ ...mappingForm, steamId: e.target.value })}
                className="bg-black/40 border-white/10 focus:border-primary font-mono text-sm"
              />
              <Input
                placeholder="Username *"
                required
                value={mappingForm.username}
                onChange={(e) => setMappingForm({ ...mappingForm, username: e.target.value })}
                className="bg-black/40 border-white/10 focus:border-primary font-mono text-sm"
              />
              <Input
                placeholder="Nickname (optional)"
                value={mappingForm.nickname}
                onChange={(e) => setMappingForm({ ...mappingForm, nickname: e.target.value })}
                className="bg-black/40 border-white/10 focus:border-primary font-mono text-sm"
              />
              <Input
                placeholder="Discord ID (optional)"
                value={mappingForm.discordId}
                onChange={(e) => setMappingForm({ ...mappingForm, discordId: e.target.value })}
                className="bg-black/40 border-white/10 focus:border-primary font-mono text-sm"
              />
            </div>
            <Button type="submit" disabled={addMappingMutation.isPending} className="w-full font-mono uppercase tracking-wider rounded-xl hover:shadow-[0_0_15px_hsl(var(--primary)/0.5)] transition-shadow">
              {addMappingMutation.isPending ? 'PROCESSING...' : 'EXECUTE_OVERRIDE'}
            </Button>
          </form>
        </div>

        {/* Owned Games Update */}
        <div className="glass-panel rounded-3xl p-8 space-y-6 border-accent/20">
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-mono text-accent flex items-center gap-2">
              <Terminal className="w-5 h-5" /> SYNC_LIBRARIES
            </h2>
            <p className="text-sm text-muted-foreground">Trigger manual synchronization of agent libraries.</p>
          </div>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Steam IDs (comma separated)"
              value={steamIdsInput}
              onChange={(e) => setSteamIdsInput(e.target.value)}
              className="min-h-[120px] bg-black/40 border-white/10 focus:border-accent font-mono text-sm resize-none"
            />
            <Input
              placeholder="App IDs to update (optional, comma separated)"
              value={appIdsInput}
              onChange={(e) => setAppIdsInput(e.target.value)}
              className="bg-black/40 border-white/10 focus:border-accent font-mono text-sm"
            />
            <UpdateTaskRunner 
              title="SYNC"
              colorClass="accent"
              onStart={() => {
                if (!steamIdsInput) return Promise.reject(new Error('Steam IDs required'))
                const appIds = appIdsInput ? appIdsInput.split(',').map(s => parseInt(s.trim())) : undefined
                return gameService.startUpdate(steamIdsInput, false, appIds)
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Bulk Updates */}
        <div className="glass-panel rounded-3xl p-8 space-y-6 border-destructive/20 bg-destructive/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <AlertOctagon className="w-32 h-32 text-destructive" />
          </div>
          <div className="space-y-2 relative z-10">
            <h2 className="text-xl font-bold font-mono text-destructive flex items-center gap-2">
              <AlertOctagon className="w-5 h-5" /> GLOBAL_DIRECTIVES
            </h2>
            <p className="text-sm text-muted-foreground">Trigger heavy backend processing tasks. High resource cost.</p>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="space-y-3 p-5 rounded-2xl bg-black/40 border border-destructive/20">
              <div className="font-mono text-sm text-white/90">UPDATE_PRICING_TABLE</div>
              <p className="text-xs text-muted-foreground">Updates the pricing manifest for all registered software.</p>
              <UpdateTaskRunner 
                title="PRICING"
                colorClass="destructive"
                onStart={() => gameService.startPriceUpdate()}
              />
            </div>
            
            <div className="space-y-3 p-5 rounded-2xl bg-black/40 border border-destructive/20">
              <div className="font-mono text-sm text-white/90">UPDATE_MANIFESTS</div>
              <p className="text-xs text-muted-foreground">Deep fetch of detailed software info. Extremely slow.</p>
              <UpdateTaskRunner 
                title="MANIFESTS"
                colorClass="destructive"
                onStart={() => gameService.startGameInfoUpdate()}
              />
            </div>
          </div>
        </div>

        {/* User Mappings Table */}
        <div className="glass-panel rounded-3xl p-8 space-y-6 flex flex-col h-full min-h-[500px]">
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
              REGISTERED_AGENTS <span className="text-primary text-sm">[{userMappings?.length || 0}]</span>
            </h2>
          </div>
          
          <div className="flex-1 rounded-2xl border border-white/10 overflow-hidden bg-black/20 relative">
            <div className="absolute inset-0 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-[#0a0a0a] z-10 shadow-sm border-b border-white/10">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="font-mono text-xs uppercase text-muted-foreground">Agent</TableHead>
                    <TableHead className="font-mono text-xs uppercase text-muted-foreground">Identifier</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappingsLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center font-mono text-sm text-muted-foreground py-12">FETCHING...</TableCell></TableRow>
                  ) : userMappings?.length ? (
                    userMappings.map((u) => (
                      <TableRow key={u.steamId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell>
                          <div className="font-medium text-white/90">{u.nickname || u.username}</div>
                          {u.nickname && <div className="text-xs text-primary font-mono">{u.username}</div>}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{u.steamId}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#141414] border-white/10 font-mono text-xs uppercase">
                              <DropdownMenuItem className="hover:bg-white/10 hover:text-primary cursor-pointer" onClick={() => {
                                setMappingForm(u)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}>
                                Edit Mapping
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem className="hover:bg-white/10 cursor-pointer" onClick={() => copyToClipboard(u.steamId)}>
                                <Copy className="mr-2 h-4 w-4" /> Copy Steam ID
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={3} className="text-center font-mono text-sm text-muted-foreground py-12">No agents found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper component to manage long-running tasks
function UpdateTaskRunner({ title, onStart, colorClass = "primary" }: { title: string, onStart: () => Promise<{ operationId: string }>, colorClass?: "primary" | "accent" | "destructive" }) {
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<any>(null)

  const btnClass = colorClass === 'destructive' 
    ? 'border-destructive/50 text-destructive hover:bg-destructive/10' 
    : colorClass === 'accent'
      ? 'border-accent/50 text-accent hover:bg-accent/10'
      : 'border-primary/50 text-primary hover:bg-primary/10'
      
  const pbgClass = colorClass === 'destructive' ? 'bg-destructive' : colorClass === 'accent' ? 'bg-accent' : 'bg-primary'

  const handleStart = async () => {
    setIsRunning(true)
    setProgress(0)
    setPhase('Initializing')
    setMessage('Starting...')
    setResult(null)

    try {
      const res = await onStart()
      pollProgress(res.operationId)
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      setIsRunning(false)
    }
  }

  const pollProgress = async (operationId: string) => {
    try {
      const p = await gameService.getProgress(operationId)
      setProgress(p.progress)
      setPhase(p.phase)
      setMessage(p.message)

      if (p.progress >= 100) {
        setPhase('Completed')
        setIsRunning(false)
        try {
          const finalResult = await gameService.getUpdateResult(operationId)
          setResult(finalResult)
          toast({ title: `${title} Completed` })
        } catch (e) {
          // ignore
        }
        return
      }

      setTimeout(() => pollProgress(operationId), (p.retryAfterSeconds || 1) * 1000)
    } catch (err) {
      setIsRunning(false)
      toast({ title: 'Polling failed', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleStart} 
        disabled={isRunning} 
        variant="outline" 
        className={`w-full font-mono uppercase tracking-wider rounded-xl transition-all ${btnClass}`}
      >
        {isRunning ? 'EXECUTING...' : `START_${title}`}
      </Button>

      {isRunning && (
        <div className="space-y-3 bg-black/60 border border-white/10 p-4 rounded-xl">
          <div className="flex justify-between text-xs font-mono uppercase text-muted-foreground">
            <span>{phase}</span>
            <span className={`text-${colorClass}`}>{progress}%</span>
          </div>
          {/* Custom progress bar for better cyberpunk feel */}
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full ${pbgClass} transition-all duration-500`} style={{ width: `${progress}%`, boxShadow: `0 0 10px var(--${colorClass})` }}></div>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground/70 uppercase truncate">{message}</p>
        </div>
      )}

      {result && !isRunning && (
        <div className="bg-black/60 border border-white/10 p-4 rounded-xl text-sm overflow-auto max-h-[200px]">
          <pre className={`text-[10px] font-mono text-${colorClass}`}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}