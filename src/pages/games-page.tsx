import { useState, useMemo } from 'react'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useQuery } from '@tanstack/react-query'
import { gameService } from '@/lib/game-service'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Search, Gamepad2, AlertCircle } from 'lucide-react'

export default function GamesPage() {
  useDocumentTitle('Games')

  const [search, setSearch] = useState('')

  const { data: games, isLoading, isError } = useQuery({
    queryKey: ['games'],
    queryFn: () => gameService.getAllGames(),
  })

  const filteredGames = useMemo(() => {
    if (!games) return []
    if (!search.trim()) return games

    const lowerSearch = search.toLowerCase()
    return games.filter((game) => 
      game.name?.toLowerCase().includes(lowerSearch) ||
      game.appid.toString().includes(lowerSearch)
    )
  }, [games, search])

  return (
    <div className="container max-w-7xl mx-auto py-12 px-6 space-y-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Gamepad2 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">Game Library</h1>
          </div>
          <p className="text-muted-foreground font-light text-lg">
            Browse and search the NerdHub archive.
          </p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl overflow-hidden focus-within:border-accent transition-colors shadow-inner">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <input
              type="search"
              placeholder="SEARCH DATABASE..."
              className="w-full bg-transparent border-none pl-12 pr-4 py-4 text-sm font-mono focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-[280px] rounded-2xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      )}

      {isError && (
        <div className="glass-panel border-destructive/30 bg-destructive/5 rounded-2xl p-8 text-center text-destructive flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12" />
          <p className="font-mono uppercase tracking-wider">System Failure: Could not connect to game database.</p>
        </div>
      )}

      {filteredGames && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {filteredGames.length} MATCH{filteredGames.length !== 1 ? 'ES' : ''} FOUND
            </p>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {filteredGames.map((game) => (
              <Link key={game.appid} to={`/games/${game.appid}`} className="group block h-full">
                <div className="glass-panel h-full rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] relative">
                  <div className="aspect-[460/215] w-full bg-black overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent z-10"></div>
                    {game.headerImage ? (
                      <img 
                        src={game.headerImage} 
                        alt={game.name} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground text-[10px] font-mono uppercase tracking-widest">No Signal</div>
                    )}
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col relative z-20 -mt-6">
                    <h3 className="font-bold text-base leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-1" title={game.name}>
                      {game.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {game.shortDescription || 'No data.'}
                    </p>
                    <div className="mt-auto flex justify-between items-center border-t border-white/5 pt-3">
                      <span className="text-[9px] font-mono text-muted-foreground">ID:{game.appid}</span>
                      <Badge variant={game.isFree ? 'secondary' : 'default'} className="font-mono text-[9px] uppercase tracking-wider bg-black/50 backdrop-blur rounded-sm px-1.5 py-0">
                        {game.priceOverview?.finalFormatted || (game.isFree ? 'Free' : 'N/A')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredGames.length === 0 && !isLoading && (
            <div className="py-24 text-center text-muted-foreground glass-panel rounded-3xl border-dashed">
              <p className="font-mono uppercase tracking-wider">No records matching "{search}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}