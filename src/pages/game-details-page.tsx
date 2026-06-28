import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gameService } from '@/lib/game-service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { getProxyImageUrl } from '@/lib/get-proxy-image'
import {
  ArrowLeft, Clock, Calendar, Trophy, Monitor, Tag, Gamepad2,
  ExternalLink, RefreshCw, ChevronDown, ChevronRight
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/date-utils'
import { formatPlaytime, calculateTotalPlaytime, getLastPlayedDate } from '@/lib/game-utils'
import { SystemRequirements } from '@/components/games/system-requirements'
import { GameContextMenu } from '@/components/game-context-menu'

export default function GameDetailsPage() {
  const { appid } = useParams<{ appid: string }>()
  const navigate = useNavigate()
  const parsedAppId = parseInt(appid || '0', 10)

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ['game', parsedAppId],
    queryFn: () => gameService.getGameById(parsedAppId),
    enabled: !!parsedAppId,
  })

  useDocumentTitle(game?.name || `Game #${parsedAppId}`)

  const { data: userMappings } = useQuery({
    queryKey: ['usernames', game?.ownedBy?.steamId],
    queryFn: () => gameService.fetchUsernames(game!.ownedBy!.steamId!),
    enabled: !!(game?.ownedBy?.steamId && game.ownedBy.steamId.length > 0),
  })

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: () => gameService.updateGameInfo(parsedAppId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', parsedAppId] })
    },
  })

  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'playtime' | 'name'>('playtime')

  const toggleUserExpansion = (steamId: string) => {
    setExpandedUsers(prev => {
      const next = new Set(prev)
      if (next.has(steamId)) next.delete(steamId)
      else next.add(steamId)
      return next
    })
  }

  const playtimeUsers = game?.playtimeByUser
    ? Object.entries(game.playtimeByUser).sort(([aId, aData], [bId, bData]) => {
        if (sortBy === 'playtime') return bData.playtime_forever - aData.playtime_forever
        const nameA = userMappings?.[aId]?.nickname || userMappings?.[aId]?.username || aId
        const nameB = userMappings?.[bId]?.nickname || userMappings?.[bId]?.username || bId
        return nameA.localeCompare(nameB)
      })
    : []

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-12 px-6 space-y-8 animate-pulse">
        <div className="h-10 w-32 rounded-xl bg-white/5 border border-white/5"></div>
        <div className="h-[400px] w-full rounded-3xl bg-white/5 border border-white/5"></div>
      </div>
    )
  }

  if (isError || !game) {
    return (
      <div className="container py-24 text-center">
        <div className="glass-panel border-destructive/30 bg-destructive/5 rounded-3xl p-12 inline-flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold text-destructive">Data Not Found</h2>
          <p className="text-muted-foreground font-mono">Record ID {appid} does not exist in the database.</p>
          <Button variant="outline" className="border-destructive/50 hover:bg-destructive/10 text-destructive" asChild>
            <Link to="/games">Abort & Return</Link>
          </Button>
        </div>
      </div>
    )
  }

  const platforms = [
    game.platforms?.windows && 'Windows',
    game.platforms?.mac && 'Mac',
    game.platforms?.linux && 'Linux',
  ].filter(Boolean) as string[]

  const playtimeByUser = game.playtimeByUser
  const totalPlaytime = calculateTotalPlaytime(game)
  const lastPlayedDate = getLastPlayedDate(game)

  return (
    <div className="min-h-screen pb-20">
      {/* Immersive Hero Header */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-black overflow-hidden flex items-end">
        <div className="absolute inset-0 z-0">
          {game.headerImage ? (
            <img src={getProxyImageUrl(game.headerImage)} alt="" className="w-full h-full object-cover opacity-40 blur-sm" />
          ) : (
            <div className="w-full h-full bg-[#050505]"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent"></div>
        </div>

        <div className="container max-w-7xl mx-auto px-6 relative z-10 pb-12 w-full">
          <Button variant="ghost" asChild className="mb-8 hover:bg-white/10 hover:text-white group">
            <Link to="/games" className="gap-2 font-mono text-xs">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-8 items-end">
            <div className="w-full max-w-[300px] rounded-2xl overflow-hidden glass-panel shadow-2xl shadow-primary/20 shrink-0">
              {game.headerImage ? (
                <img src={getProxyImageUrl(game.headerImage)} alt={game.name} className="w-full h-auto object-cover" />
              ) : (
                <div className="flex h-32 items-center justify-center text-muted-foreground font-mono text-xs">NO IMAGE</div>
              )}
            </div>

            <div className="space-y-4 flex-1">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-md">
                {game.name}
              </h1>
              <div className="flex flex-wrap gap-2 pt-2">
                {game.genres?.map((g) => (
                  <Badge key={g.description} variant="outline" className="bg-white/5 border-white/10 backdrop-blur font-mono text-[10px]">
                    {g.description}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="container max-w-7xl mx-auto px-6 pt-6">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`https://store.steampowered.com/app/${game.appid}`} target="_blank" rel="noreferrer" className="gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              Steam
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`https://steamdb.info/app/${game.appid}`} target="_blank" rel="noreferrer" className="gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              SteamDB
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`https://www.protondb.com/app/${game.appid}`} target="_blank" rel="noreferrer" className="gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              ProtonDB
            </a>
          </Button>
          <Button variant="outline" size="sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            <RefreshCw className={`w-3.5 h-3.5 ${updateMutation.isPending ? 'animate-spin' : ''}`} />
            {updateMutation.isPending ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 pt-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel rounded-3xl p-8 space-y-4">
              <h3 className="text-sm font-mono text-primary flex items-center gap-2">
                <Tag className="w-4 h-4" /> Briefing
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {game.shortDescription}
              </p>

              {/* Categories */}
              {game.categories && game.categories.length > 0 && (
                <div className="pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {game.categories.map((cat) => (
                      <Badge key={cat.description} variant="outline" className="text-[10px] font-mono bg-white/[0.07] border-white/10 text-white/70">
                        {cat.description}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {game.detailedDescription && (
              <div className="glass-panel rounded-3xl p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Gamepad2 className="w-32 h-32" />
                </div>
                <h3 className="text-sm font-mono text-accent relative z-10">Data Log // Full Description</h3>

                <div
                  className="prose prose-sm md:prose-base dark:prose-invert max-w-none relative z-10
                    [&>img]:rounded-xl [&>img]:my-6 [&>img]:border [&>img]:border-white/5
                    [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:text-white
                    [&>a]:text-primary [&>a]:no-underline hover:[&>a]:underline
                    text-muted-foreground/90 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: game.detailedDescription }}
                />
              </div>
            )}

            {/* System Requirements */}
            <SystemRequirements
              pc={game.pcRequirements}
              mac={game.macRequirements}
              linux={game.linuxRequirements}
              platforms={platforms}
            />
          </div>

          {/* Sidebar details */}
          <div className="space-y-6">
            <div className="glass-panel rounded-3xl p-6 space-y-6">
              <h3 className="text-sm font-mono text-white border-b border-white/5 pb-4">Specs</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center group">
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                    Acquisition Cost
                  </span>
                  <span className="text-right">
                    {game.isFree ? (
                      <span className="text-[11px] font-mono font-bold text-green-400">Free</span>
                    ) : !game.priceOverview?.finalFormatted ? (
                      <span className="text-[9px] font-mono text-muted-foreground">N/A</span>
                    ) : game.priceOverview.discountPercent > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold font-mono text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded-sm">
                          -{game.priceOverview.discountPercent}%
                        </span>
                        <div className="flex flex-col items-end leading-tight">
                          <span className="text-[9px] font-mono text-muted-foreground line-through">{game.priceOverview.initialFormatted}</span>
                          <span className="text-[11px] font-bold font-mono text-white">{game.priceOverview.finalFormatted}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono font-bold text-white">{game.priceOverview.finalFormatted}</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center group">
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Launched
                  </span>
                  <span className="text-sm font-mono">
                    {game.releaseDate?.date || 'Unknown'}
                    {game.releaseDate?.comingSoon && ' (Soon)'}
                  </span>
                </div>

                {game.metacritic?.score && (
                  <div className="flex justify-between items-center group">
                    <span className="text-muted-foreground text-sm flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-accent" /> Rating
                    </span>
                    <span className="font-bold text-accent drop-shadow-[0_0_8px_hsl(var(--accent)/0.5)] text-lg">
                      {game.metacritic.score}
                    </span>
                  </div>
                )}

                {platforms.length > 0 && (
                  <div className="flex justify-between items-center group">
                    <span className="text-muted-foreground text-sm flex items-center gap-2">
                      <Monitor className="w-4 h-4" /> Systems
                    </span>
                    <span className="text-xs font-mono">{platforms.join(' / ')}</span>
                  </div>
                )}

                {game.controllerSupport && (
                  <div className="flex justify-between items-center group">
                    <span className="text-muted-foreground text-sm flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4" /> Controller
                    </span>
                    <span className="text-xs font-mono">{game.controllerSupport}</span>
                  </div>
                )}

              </div>
            </div>

            {/* Playtime Statistics */}
            {playtimeByUser && Object.keys(playtimeByUser).length > 0 && (
              <div className="glass-panel rounded-3xl p-6 space-y-6 border-accent/20 bg-accent/5">
                <h3 className="text-sm font-mono text-accent flex items-center gap-2 border-b border-white/5 pb-4">
                  <Clock className="w-4 h-4" /> Playtime Statistics
                </h3>

                {/* Total Playtime Summary */}
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">Total Playtime:</span>{' '}
                    <span className="font-mono text-accent">{formatPlaytime(totalPlaytime)}</span>
                  </div>
                  {lastPlayedDate && (
                    <div>
                      <span className="text-muted-foreground">Last Played:</span>{' '}
                      <span className="font-mono">{formatDate(lastPlayedDate)}</span>
                    </div>
                  )}
                </div>

                {/* Per-User Breakdown */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-mono">
                      {playtimeUsers.length} user{playtimeUsers.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-muted-foreground font-mono">Sort:</label>
                      <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'playtime' | 'name')}>
                        <SelectTrigger className="h-6 px-1.5 py-0 text-[10px] font-mono gap-1 border-white/10 bg-black/40 text-muted-foreground focus:ring-0 focus:border-accent/50 w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-background/95 backdrop-blur-xl text-[10px] font-mono min-w-[80px]">
                          <SelectItem value="playtime" className="text-[10px] font-mono">Playtime</SelectItem>
                          <SelectItem value="name" className="text-[10px] font-mono">Name</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {playtimeUsers.map(([steamId, userData]) => {
                      const user = userMappings?.[steamId]
                      const displayName = user?.nickname || user?.username || `User ${steamId.slice(0, 8)}`
                      const expanded = expandedUsers.has(steamId)
                      const hasPlatformData =
                        (userData.playtime_windows_forever ?? 0) > 0 ||
                        (userData.playtime_mac_forever ?? 0) > 0 ||
                        (userData.playtime_linux_forever ?? 0) > 0 ||
                        (userData.playtime_deck_forever ?? 0) > 0 ||
                        (userData.playtime_disconnected ?? 0) > 0

                      return (
                        <GameContextMenu key={steamId} steamId={steamId} userMapping={user}>
                          <div
                            className="rounded-xl bg-black/40 border border-white/5 hover:border-accent/30 transition-colors relative cursor-context-menu"
                          >
                            <button
                              onClick={() => toggleUserExpansion(steamId)}
                              className="w-full flex items-center justify-between p-2.5 text-left"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {expanded ? (
                                  <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground" />
                                )}
                                <span className="text-xs text-white/90 truncate">{displayName}</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                {userData.rtime_last_played > 0 && (
                                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                                    {formatDate(userData.rtime_last_played * 1000)}
                                  </span>
                                )}
                                <span className="text-[11px] font-mono text-accent">
                                  {formatPlaytime(userData.playtime_forever)}
                                </span>
                              </div>
                            </button>

                            {/* Expandable Platform Breakdown */}
                            {expanded && (
                              <div className="px-2.5 pb-2.5 pt-0 border-t border-white/5 mt-0">
                                <div className="pt-2.5 space-y-0.5 text-[11px] text-muted-foreground">
                                  <h5 className="text-white/60 mb-1 font-mono text-[10px]">Platform Breakdown:</h5>
                                  {(userData.playtime_windows_forever ?? 0) > 0 && (
                                    <div className="flex justify-between"><span>Windows</span><span className="font-mono">{formatPlaytime(userData.playtime_windows_forever)}</span></div>
                                  )}
                                  {(userData.playtime_mac_forever ?? 0) > 0 && (
                                    <div className="flex justify-between"><span>Mac</span><span className="font-mono">{formatPlaytime(userData.playtime_mac_forever)}</span></div>
                                  )}
                                  {(userData.playtime_linux_forever ?? 0) > 0 && (
                                    <div className="flex justify-between"><span>Linux</span><span className="font-mono">{formatPlaytime(userData.playtime_linux_forever)}</span></div>
                                  )}
                                  {(userData.playtime_deck_forever ?? 0) > 0 && (
                                    <div className="flex justify-between"><span>Steam Deck</span><span className="font-mono">{formatPlaytime(userData.playtime_deck_forever)}</span></div>
                                  )}
                                  {(userData.playtime_disconnected ?? 0) > 0 && (
                                    <div className="flex justify-between"><span>Offline</span><span className="font-mono">{formatPlaytime(userData.playtime_disconnected)}</span></div>
                                  )}
                                  {!hasPlatformData && (
                                    <p className="italic text-[10px]">No platform-specific data available</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </GameContextMenu>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* DB Record */}
            <div className="glass-panel rounded-3xl p-6 space-y-3">
              <h3 className="text-sm font-mono text-white/60 border-b border-white/5 pb-3">DB Record</h3>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Steam ID</span>
                <a
                  href={`https://store.steampowered.com/app/${game.appid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-primary hover:text-white hover:underline transition-colors"
                >
                  [{game.appid}]
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Last Modified</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {game.lastModifiedTime
                    ? formatDateTime(game.lastModifiedTime)
                    : 'Not available'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
