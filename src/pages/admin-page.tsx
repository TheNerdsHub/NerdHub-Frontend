import { useState, useMemo } from "react"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { gameService, type UserMapping } from "@/lib/game-service"
import { GameContextMenu } from "@/components/game-context-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SortableTable } from "@/components/ui/sortable-table"
import { UpdateTaskRunner } from "@/components/ui/update-task-runner"
import { useToast } from "@/hooks/use-toast"
import { Copy, ShieldCheck, AlertOctagon, Terminal, CheckSquare, Square, ArrowUp, ArrowDown } from "lucide-react"

export default function AdminPage() {
  useDocumentTitle("Admin")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // User Mappings State
  const [mappingForm, setMappingForm] = useState<UserMapping>({ steamId: "", username: "", nickname: "", discordId: "" })
  const [steamIdsInput, setSteamIdsInput] = useState("")
  const [appIdsInput, setAppIdsInput] = useState("")
  const [selectedSteamIds, setSelectedSteamIds] = useState<Set<string>>(new Set())
  const [batchSize, setBatchSize] = useState(400)
  const [sortColumn, setSortColumn] = useState<string>("nickname")
  const [sortDesc, setSortDesc] = useState(false)

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDesc(!sortDesc)
    } else {
      setSortColumn(col)
      setSortDesc(false)
    }
  }

  const { data: userMappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ["user-mappings"],
    queryFn: () => gameService.getUserMappings(),
  })

  const sortedMappings = useMemo(() => {
    if (!userMappings) return []
    const sorted = [...userMappings]
    if (!sortColumn) return sorted
    sorted.sort((a, b) => {
      let cmp = 0
      if (sortColumn === "username") cmp = (a.username || "").localeCompare(b.username || "")
      else if (sortColumn === "steamId") cmp = a.steamId.localeCompare(b.steamId)
      else if (sortColumn === "discordId") cmp = (a.discordId || "").localeCompare(b.discordId || "")
      else if (sortColumn === "nickname") cmp = (a.nickname || "").localeCompare(b.nickname || "")
      return sortDesc ? -cmp : cmp
    })
    return sorted
  }, [userMappings, sortColumn, sortDesc])

  const addMappingMutation = useMutation({
    mutationFn: (data: UserMapping) => gameService.addOrUpdateUserMapping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-mappings"] })
      toast({ title: "Success", description: "User mapping updated." })
      setMappingForm({ steamId: "", username: "", nickname: "", discordId: "" })
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  })

  const handleMappingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mappingForm.steamId || !mappingForm.username) return
    addMappingMutation.mutate(mappingForm)
  }

  const tableColumns = [
    {
      key: "select",
      header: "",
      width: "w-[40px]",
      render: (u: UserMapping) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-accent"
          onClick={(e) => {
            e.stopPropagation()
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
      ),
    },
    {
      key: "nickname",
      header: "Nickname",
      sortable: true,
      width: "w-[120px]",
      render: (u: UserMapping) => <div className="font-medium text-white/90">{u.nickname || "\u2014"}</div>,
    },
    {
      key: "steamId",
      header: "Steam ID",
      sortable: true,
      render: (u: UserMapping) => <span className="font-mono text-xs text-muted-foreground">{u.steamId}</span>,
    },
    {
      key: "discordId",
      header: "Discord ID",
      sortable: true,
      render: (u: UserMapping) => <span className="font-mono text-xs text-muted-foreground">{u.discordId || "\u2014"}</span>,
    },
    {
      key: "username",
      header: "Username",
      sortable: true,
      render: (u: UserMapping) => <span className="font-mono text-xs text-muted-foreground">{u.username}</span>,
    },
  ]

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
              {addMappingMutation.isPending ? "Processing..." : "Execute Override"}
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
                if (!steamIdsInput) return Promise.reject(new Error("Steam IDs required"))
                const appIds = appIdsInput ? appIdsInput.split(",").map(s => parseInt(s.trim())) : undefined
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
          
          <SortableTable
            columns={tableColumns}
            data={sortedMappings}
            sortColumn={sortColumn}
            sortDesc={sortDesc}
            onSort={handleSort}
            keyExtractor={(u) => u.steamId}
            isLoading={mappingsLoading}
            emptyMessage="No users found."
            onRowClick={(u) => {
              const next = new Set(selectedSteamIds)
              if (next.has(u.steamId)) {
                next.delete(u.steamId)
              } else {
                next.add(u.steamId)
              }
              setSelectedSteamIds(next)
            }}
            rowWrapper={(u, children) => (
              <GameContextMenu
                steamId={u.steamId}
                userMapping={u}
                onEdit={() => {
                  setMappingForm(u)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
              >
                {children}
              </GameContextMenu>
            )}
          />

          {selectedSteamIds.size > 0 && (
            <Button
              variant="outline"
              className="border-accent/50 text-accent hover:bg-accent/10 font-mono text-xs rounded-xl"
              onClick={() => {
                setSteamIdsInput(Array.from(selectedSteamIds).join(", "))
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
            >
              Populate {selectedSteamIds.size} Agent{selectedSteamIds.size > 1 ? "s" : ""} into sync
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
