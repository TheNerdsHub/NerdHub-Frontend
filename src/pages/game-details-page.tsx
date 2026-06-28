import { useParams, Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useQuery } from '@tanstack/react-query'
import { gameService } from '@/lib/game-service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, Users, Calendar, Trophy, Monitor, Tag, Gamepad2 } from 'lucide-react'

export default function GameDetailsPage() {
  const { appid } = useParams<{ appid: string }>()
  const parsedAppId = parseInt(appid || '0', 10)

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ['game', parsedAppId],
    queryFn: () => gameService.getGameById(parsedAppId),
    enabled: !!parsedAppId,
  })

  useDocumentTitle(game?.name || `Game #${parsedAppId}`)

  // Fetch usernames for owners
  const { data: userMappings } = useQuery({
    queryKey: ['usernames', game?.ownedBy?.steamId],
    queryFn: () => gameService.fetchUsernames(game!.ownedBy!.steamId!),
    enabled: !!(game?.ownedBy?.steamId && game.ownedBy.steamId.length > 0),
  })

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

  const owners = game.ownedBy?.steamId || []
  const platforms = [
    game.platforms?.windows && 'Windows',
    game.platforms?.mac && 'Mac',
    game.platforms?.linux && 'Linux',
  ].filter(Boolean) as string[]

  return (
    <div className="min-h-screen pb-20">
      {/* Immersive Hero Header */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-black overflow-hidden flex items-end">
        <div className="absolute inset-0 z-0">
          {game.headerImage ? (
            <img src={game.headerImage} alt="" className="w-full h-full object-cover opacity-40 blur-sm" />
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
                <img src={game.headerImage} alt={game.name} className="w-full h-auto object-cover" />
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
                  <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 font-mono">
                    {game.priceOverview?.finalFormatted || (game.isFree ? 'Free' : 'N/A')}
                  </Badge>
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

                <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                  <span className="text-muted-foreground text-sm">Steam ID</span>
                  <a 
                    href={`https://store.steampowered.com/app/${game.appid}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm font-mono text-primary hover:text-white hover:underline transition-colors"
                  >
                    [{game.appid}]
                  </a>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 space-y-6 border-accent/20 bg-accent/5">
              <h3 className="text-sm font-mono text-accent flex items-center gap-2 border-b border-white/5 pb-4">
                <Users className="w-4 h-4" /> Active Agents ({owners.length})
              </h3>
              
              {owners.length > 0 ? (
                <ul className="space-y-3">
                  {owners.map((steamId) => {
                    const user = userMappings?.[steamId]
                    const displayName = user?.nickname || user?.username || steamId
                    const playtime = game.playtimeByUser?.[steamId]?.playtime_forever || 0
                    
                    return (
                      <li key={steamId} className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5 hover:border-accent/30 transition-colors">
                        <span className="font-medium text-sm text-white/90">{displayName}</span>
                        {playtime > 0 && (
                          <span className="text-xs font-mono text-accent flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {Math.round(playtime / 60)}H
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-xs font-mono text-muted-foreground text-center py-4">No agents registered.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}