import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
import { Copy, ShieldCheck, AlertOctagon, Terminal, CheckSquare, Square, ArrowUp, ArrowDown } from 'lucide-react'

export default function AdminPage() {
  useDocumentTitle('Admin')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // User Mappings State
  const [mappingForm, setMappingForm] = useState<UserMapping>({ steamId: '', username: '', nickname: '', discordId: '' })
  const [steamIdsInput, setSteamIdsInput] = useState('')
  const [appIdsInput, setAppIdsInput] = useState('')
  const [selectedSteamIds, setSelectedSteamIds] = useState<Set<string>>(new Set())
  const [batchSize, setBatchSize] = useState(400)
  const [sortColumn, setSortColumn] = useState<string>('nickname')
  const [sortDesc, setSortDesc] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ user: UserMapping; x: number; y: number } | null>(null)

  useEffect(() => {
    const close = () => setContextMenu(null)
    if (contextMenu) document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [contextMenu])

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDesc(!sortDesc)
    } else {
      setSortColumn(col)
      setSortDesc(false)
    }
  }

  const { data: userMappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ['user-mappings'],
    queryFn: () => gameService.getUserMappings(),
  })

  const sortedMappings = useMemo(() => {
    if (!userMappings) return []
    const sorted = [...userMappings]
    if (!sortColumn) return sorted
    sorted.sort((a, b) => {
      let cmp = 0
      if (sortColumn === 'username') cmp = (a.username || '').localeCompare(b.username || '')
      else if (sortColumn === 'steamId') cmp = a.steamId.localeCompare(b.steamId)
      else if (sortColumn === 'discordId') cmp = (a.discordId || '').localeCompare(b.discordId || '')
      else if (sortColumn === 'nickname') cmp = (a.nickname || '').localeCompare(b.nickname || '')
      return sortDesc ? -cmp : cmp
    })
    return sorted
  }, [userMappings, sortColumn, sortDesc])

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
        <p className="text-muted-foreground font-mono text-sm">
          Warning: Authorized personnel only. System overrides active.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* User Mapping Form */}
        <div className="glass-panel rounded-3xl p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-mono text-primary flex items-center gap-2">
              <Terminal className="w-5 h-5" /> Identity Mapping
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
            <Button type="submit" disabled={addMappingMutation.isPending} className="w-full font-mono rounded-xl hover:shadow-[0_0_15px_hsl(var(--primary)/0.5)] transition-shadow">
              {addMappingMutation.isPending ? 'Processing...' : 'Execute Override'}
            </Button>
          </form>
        </div>

        {/* Owned Games Update */}
        <div className="glass-panel rounded-3xl p-8 space-y-6 border-accent/20">
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-mono text-accent flex items-center gap-2">
              <Terminal className="w-5 h-5" /> Sync Libraries
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
              title="Sync"
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
              <AlertOctagon className="w-5 h-5" /> Global Directives
            </h2>
            <p className="text-sm text-muted-foreground">Trigger heavy backend processing tasks. High resource cost.</p>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="space-y-3 p-5 rounded-2xl bg-black/40 border border-destructive/20">
              <div className="font-mono text-sm text-white/90">Update Pricing Table</div>
              <p className="text-xs text-muted-foreground">Updates the pricing manifest for all registered software.</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>Batch Size</span>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={batchSize}
                    onChange={(e) => setBatchSize(Math.min(500, Math.max(1, Number(e.target.value) || 1)))}
                    className="w-16 h-7 bg-black/60 border border-white/10 rounded-lg px-2 text-xs font-mono text-destructive text-center focus:outline-none focus:border-destructive [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <input
                  type="range"
                  min={1}
                  max={500}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-destructive
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-destructive
                    [&::-webkit-slider-thumb]:shadow-[0_0_8px_hsl(var(--destructive))]"
                />
              </div>
              <UpdateTaskRunner 
                title="Pricing"
                colorClass="destructive"
                onStart={() => gameService.startPriceUpdate(batchSize)}
              />
            </div>
            
            <div className="space-y-3 p-5 rounded-2xl bg-black/40 border border-destructive/20">
              <div className="font-mono text-sm text-white/90">Update Manifests</div>
              <p className="text-xs text-muted-foreground">Deep fetch of detailed software info. Extremely slow.</p>
              <UpdateTaskRunner 
                title="Manifests"
                colorClass="destructive"
                onStart={() => gameService.startGameInfoUpdate()}
              />
            </div>
          </div>
        </div>

        {/* User Mappings Table */}
        <div className="glass-panel rounded-3xl p-8 space-y-6 flex flex-col h-full min-h-[500px]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
              Registered Agents <span className="text-primary text-sm">[{userMappings?.length || 0}]</span>
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="border-accent/50 text-accent hover:bg-accent/10 font-mono text-xs rounded-xl gap-2"
              onClick={() => {
                const allSelected = userMappings?.every(u => selectedSteamIds.has(u.steamId))
                if (allSelected) {
                  setSelectedSteamIds(new Set())
                } else {
                  setSelectedSteamIds(new Set(userMappings?.map(u => u.steamId) || []))
                }
              }}
            >
              {userMappings?.every(u => selectedSteamIds.has(u.steamId)) ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              Select All
            </Button>
            {selectedSteamIds.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-muted-foreground hover:text-white hover:border-white/40 font-mono text-xs rounded-xl"
                onClick={() => setSelectedSteamIds(new Set())}
              >
                Clear All
              </Button>
            )}
          </div>
          
          <div className="flex-1 rounded-2xl border border-white/10 overflow-hidden bg-black/20 relative">
            <div className="absolute inset-0 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-[#0a0a0a] z-10 shadow-sm border-b border-white/10">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead className="font-mono text-xs text-muted-foreground cursor-pointer select-none whitespace-nowrap w-[120px]" onClick={() => handleSort('nickname')}>
                      Nickname{sortColumn === 'nickname' && (sortDesc ? <ArrowDown className="w-3 h-3 inline ml-1" /> : <ArrowUp className="w-3 h-3 inline ml-1" />)}
                    </TableHead>
                    <TableHead className="font-mono text-xs text-muted-foreground cursor-pointer select-none" onClick={() => handleSort('steamId')}>
                      Steam ID{sortColumn === 'steamId' && (sortDesc ? <ArrowDown className="w-3 h-3 inline ml-1" /> : <ArrowUp className="w-3 h-3 inline ml-1" />)}
                    </TableHead>
                    <TableHead className="font-mono text-xs text-muted-foreground cursor-pointer select-none" onClick={() => handleSort('discordId')}>
                      Discord ID{sortColumn === 'discordId' && (sortDesc ? <ArrowDown className="w-3 h-3 inline ml-1" /> : <ArrowUp className="w-3 h-3 inline ml-1" />)}
                    </TableHead>
                    <TableHead className="font-mono text-xs text-muted-foreground cursor-pointer select-none" onClick={() => handleSort('username')}>
                      Username{sortColumn === 'username' && (sortDesc ? <ArrowDown className="w-3 h-3 inline ml-1" /> : <ArrowUp className="w-3 h-3 inline ml-1" />)}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappingsLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center font-mono text-sm text-muted-foreground py-12">Fetching...</TableCell></TableRow>
                  ) : sortedMappings.length ? (
                    sortedMappings.map((u) => (
                      <TableRow key={u.steamId} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => {
                        const next = new Set(selectedSteamIds)
                        if (next.has(u.steamId)) {
                          next.delete(u.steamId)
                        } else {
                          next.add(u.steamId)
                        }
                        setSelectedSteamIds(next)
                      }} onContextMenu={(e) => {
                        e.preventDefault()
                        setContextMenu({ user: u, x: e.clientX, y: e.clientY })
                      }}>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-accent"
                            onClick={() => {
                              const next = new Set(selectedSteamIds)
                              if (next.has(u.steamId)) {
                                next.delete(u.steamId)
                              } else {
                                next.add(u.steamId)
                              }
                              setSelectedSteamIds(next)
                            }}
                          >
                            {selectedSteamIds.has(u.steamId) ? (
                              <CheckSquare className="w-4 h-4 text-accent" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-white/90">{u.nickname || '—'}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{u.steamId}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{u.discordId || '—'}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{u.username}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="text-center font-mono text-sm text-muted-foreground py-12">No users found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {contextMenu && createPortal(
            <div
              className="fixed z-50 bg-[#141414] border border-white/10 rounded-xl py-1 font-mono text-xs shadow-2xl"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onClick={() => setContextMenu(null)}
            >
              <button className="w-full text-left px-3 py-1.5 hover:bg-white/10 hover:text-primary cursor-pointer" onClick={() => { setMappingForm(contextMenu.user); window.scrollTo({ top: 0, behavior: 'smooth' }); setContextMenu(null) }}>
                Edit Mapping
              </button>
              <div className="border-t border-white/10 my-1" />
              <button className="w-full text-left px-3 py-1.5 hover:bg-white/10 cursor-pointer flex items-center gap-2" onClick={() => { copyToClipboard(contextMenu.user.steamId); setContextMenu(null) }}>
                <Copy className="w-3.5 h-3.5" /> Copy Steam ID
              </button>
              <button className="w-full text-left px-3 py-1.5 hover:bg-white/10 cursor-pointer flex items-center gap-2" onClick={() => { copyToClipboard(contextMenu.user.discordId || ''); setContextMenu(null) }}>
                <Copy className="w-3.5 h-3.5" /> Copy Discord ID
              </button>
              <button className="w-full text-left px-3 py-1.5 hover:bg-white/10 cursor-pointer flex items-center gap-2" onClick={() => { copyToClipboard(contextMenu.user.username); setContextMenu(null) }}>
                <Copy className="w-3.5 h-3.5" /> Copy Username
              </button>
              <button className="w-full text-left px-3 py-1.5 hover:bg-white/10 cursor-pointer flex items-center gap-2" onClick={() => { copyToClipboard(contextMenu.user.nickname || ''); setContextMenu(null) }}>
                <Copy className="w-3.5 h-3.5" /> Copy Nickname
              </button>
            </div>,
            document.body
          )}

          {selectedSteamIds.size > 0 && (
            <Button
              variant="outline"
              className="border-accent/50 text-accent hover:bg-accent/10 font-mono text-xs rounded-xl"
              onClick={() => {
                setSteamIdsInput(Array.from(selectedSteamIds).join(', '))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              Populate {selectedSteamIds.size} Agent{selectedSteamIds.size > 1 ? 's' : ''} into sync
            </Button>
          )}
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
        className={`w-full font-mono rounded-xl transition-all ${btnClass}`}
      >
        {isRunning ? 'Executing...' : `Start ${title}`}
      </Button>

      {isRunning && (
        <div className="space-y-3 bg-black/60 border border-white/10 p-4 rounded-xl">
          <div className="flex justify-between text-xs font-mono text-muted-foreground">
            <span>{phase}</span>
            <span className={`text-${colorClass}`}>{progress}%</span>
          </div>
          {/* Custom progress bar for better cyberpunk feel */}
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full ${pbgClass} transition-all duration-500`} style={{ width: `${progress}%`, boxShadow: `0 0 10px var(--${colorClass})` }}></div>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground/70 truncate">{message}</p>
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