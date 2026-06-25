import { useParams, Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useQuery } from '@tanstack/react-query'
import { gameService } from '@/lib/game-service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Clock, Users, Calendar, Trophy, Monitor } from 'lucide-react'

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
      <div className="container py-8 space-y-8">
        <div className="h-8 w-32 animate-pulse rounded bg-muted"></div>
        <div className="h-[400px] w-full animate-pulse rounded-lg bg-muted"></div>
      </div>
    )
  }

  if (isError || !game) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold text-destructive">Game not found</h2>
        <p className="mt-2 text-muted-foreground">The game with App ID {appid} could not be loaded.</p>
        <Button variant="outline" className="mt-6" asChild>
          <Link to="/games">Back to Games</Link>
        </Button>
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
    <div className="container py-8 space-y-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/games" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Games
        </Link>
      </Button>

      {/* Header section with image and key details */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="overflow-hidden rounded-lg border bg-muted">
            {game.headerImage ? (
              <img src={game.headerImage} alt={game.name} className="w-full h-auto object-cover" />
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                No Header Image
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{game.name}</h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {game.shortDescription}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {game.genres?.map((g) => (
              <Badge key={g.description} variant="secondary">{g.description}</Badge>
            ))}
          </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Price</span>
                <Badge variant={game.isFree ? 'secondary' : 'default'} className="text-sm">
                  {game.priceOverview?.finalFormatted || (game.isFree ? 'Free' : 'N/A')}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Release Date
                </span>
                <span className="text-right text-sm">
                  {game.releaseDate?.date || 'Unknown'}
                  {game.releaseDate?.comingSoon && ' (Coming Soon)'}
                </span>
              </div>

              {game.metacritic?.score && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Trophy className="h-4 w-4" /> Metacritic
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {game.metacritic.score}
                  </span>
                </div>
              )}

              {platforms.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Monitor className="h-4 w-4" /> Platforms
                  </span>
                  <span className="text-right text-sm">{platforms.join(', ')}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-muted-foreground">App ID</span>
                <a 
                  href={`https://store.steampowered.com/app/${game.appid}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {game.appid}
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Owned By ({owners.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {owners.length > 0 ? (
                <ul className="space-y-2">
                  {owners.map((steamId) => {
                    const user = userMappings?.[steamId]
                    const displayName = user?.nickname || user?.username || steamId
                    return (
                      <li key={steamId} className="flex justify-between text-sm">
                        <span>{displayName}</span>
                        {/* Playtime if available */}
                        {game.playtimeByUser?.[steamId] && (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.round(game.playtimeByUser[steamId].playtime_forever / 60)}h
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nobody owns this game yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Description */}
      {game.detailedDescription && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About This Game</CardTitle>
          </CardHeader>
          <CardContent>
            {/* The description from Steam is usually HTML */}
            <div 
              className="prose prose-sm dark:prose-invert max-w-none 
                [&>img]:rounded-md [&>img]:my-4 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-4"
              dangerouslySetInnerHTML={{ __html: game.detailedDescription }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
