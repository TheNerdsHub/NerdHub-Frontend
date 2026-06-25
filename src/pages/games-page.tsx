import { useState, useMemo } from 'react'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useQuery } from '@tanstack/react-query'
import { gameService } from '@/lib/game-service'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'

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
    <div className="container py-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Game Library</h1>
          <p className="mt-2 text-muted-foreground">
            Browse and search the NerdHub game collection.
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search games..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="h-[280px] animate-pulse bg-muted" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive p-8 text-center text-destructive">
          <p>Failed to load games. Please try again later.</p>
        </div>
      )}

      {filteredGames && (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
          </p>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {filteredGames.map((game) => (
              <Card key={game.appid} className="overflow-hidden flex flex-col transition-colors hover:bg-muted/50">
                <div className="aspect-[460/215] w-full bg-muted">
                  {game.headerImage ? (
                    <img 
                      src={game.headerImage} 
                      alt={game.name} 
                      className="h-full w-full object-cover" 
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      No Image
                    </div>
                  )}
                </div>
                <CardHeader className="p-4 flex-1">
                  <CardTitle className="line-clamp-1 text-base" title={game.name}>{game.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2 text-xs">
                    {game.shortDescription || 'No description available.'}
                  </CardDescription>
                </CardHeader>
                <div className="p-4 pt-0 mt-auto flex items-center justify-between">
                  <Badge variant={game.isFree ? 'secondary' : 'default'} className="text-[10px]">
                    {game.priceOverview?.finalFormatted || (game.isFree ? 'Free' : 'N/A')}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/games/${game.appid}`}>Details</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <p>No games found matching "{search}"</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
