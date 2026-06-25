import { useState } from 'react'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gameService, type UserMapping } from '@/lib/game-service'
import { copyToClipboard } from '@/lib/clipboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Copy } from 'lucide-react'

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
    <div className="container py-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage users and trigger backend updates.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* User Mapping Form */}
        <Card>
          <CardHeader>
            <CardTitle>User Mappings</CardTitle>
            <CardDescription>Link Steam IDs to Usernames.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMappingSubmit} className="space-y-4">
              <Input
                placeholder="Steam ID *"
                required
                value={mappingForm.steamId}
                onChange={(e) => setMappingForm({ ...mappingForm, steamId: e.target.value })}
              />
              <Input
                placeholder="Username *"
                required
                value={mappingForm.username}
                onChange={(e) => setMappingForm({ ...mappingForm, username: e.target.value })}
              />
              <Input
                placeholder="Nickname (optional)"
                value={mappingForm.nickname}
                onChange={(e) => setMappingForm({ ...mappingForm, nickname: e.target.value })}
              />
              <Input
                placeholder="Discord ID (optional)"
                value={mappingForm.discordId}
                onChange={(e) => setMappingForm({ ...mappingForm, discordId: e.target.value })}
              />
              <Button type="submit" disabled={addMappingMutation.isPending} className="w-full">
                {addMappingMutation.isPending ? 'Saving...' : 'Add / Update Mapping'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Owned Games Update */}
        <Card>
          <CardHeader>
            <CardTitle>Update Owned Games</CardTitle>
            <CardDescription>Trigger an update for user libraries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Steam IDs (comma separated)"
              value={steamIdsInput}
              onChange={(e) => setSteamIdsInput(e.target.value)}
              className="min-h-[100px]"
            />
            <Input
              placeholder="App IDs to update (optional, comma separated)"
              value={appIdsInput}
              onChange={(e) => setAppIdsInput(e.target.value)}
            />
            <UpdateTaskRunner 
              title="Owned Games"
              onStart={() => {
                if (!steamIdsInput) return Promise.reject(new Error('Steam IDs required'))
                const appIds = appIdsInput ? appIdsInput.split(',').map(s => parseInt(s.trim())) : undefined
                return gameService.startUpdate(steamIdsInput, false, appIds)
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Bulk Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Global Updates</CardTitle>
            <CardDescription>Trigger global backend processing tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 border rounded-md p-4">
              <div className="font-medium">Game Prices</div>
              <p className="text-sm text-muted-foreground mb-4">Updates the price information for all games in the database.</p>
              <UpdateTaskRunner 
                title="Price Update"
                onStart={() => gameService.startPriceUpdate()}
              />
            </div>
            
            <div className="space-y-2 border rounded-md p-4">
              <div className="font-medium">Game Info</div>
              <p className="text-sm text-muted-foreground mb-4">Updates detailed information for all games. This can take a while.</p>
              <UpdateTaskRunner 
                title="Game Info Update"
                onStart={() => gameService.startGameInfoUpdate()}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Mappings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Mappings ({userMappings?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border h-[400px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Steam ID</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappingsLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                  ) : userMappings?.length ? (
                    userMappings.map((u) => (
                      <TableRow key={u.steamId}>
                        <TableCell>
                          <div className="font-medium">{u.nickname || u.username}</div>
                          {u.nickname && <div className="text-xs text-muted-foreground">{u.username}</div>}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{u.steamId}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setMappingForm(u)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}>
                                Edit Mapping
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => copyToClipboard(u.steamId)}>
                                <Copy className="mr-2 h-4 w-4" /> Copy Steam ID
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={3} className="text-center">No mappings found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper component to manage long-running tasks
function UpdateTaskRunner({ title, onStart }: { title: string, onStart: () => Promise<{ operationId: string }> }) {
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<any>(null)

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
      <Button onClick={handleStart} disabled={isRunning} variant="outline" className="w-full">
        {isRunning ? 'Running...' : `Start ${title}`}
      </Button>

      {isRunning && (
        <div className="space-y-2 bg-muted p-4 rounded-md">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{phase}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
      )}

      {result && !isRunning && (
        <div className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-[200px]">
          <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
