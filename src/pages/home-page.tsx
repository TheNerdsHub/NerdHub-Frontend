import { useDocumentTitle } from '@/hooks/use-document-title'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { quoteService } from '@/lib/quote-service'
import { gameService } from '@/lib/game-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  useDocumentTitle('Home')

  const { data: quote } = useQuery({
    queryKey: ['qotd'],
    queryFn: () => quoteService.getQuoteOfTheDay(),
  })

  const { data: games } = useQuery({
    queryKey: ['featured-games'],
    queryFn: () => gameService.getAllGames(),
    select: (data) => {
      // Get 4 random games that have a header image
      const withImages = data.filter((g) => g.headerImage)
      const shuffled = [...withImages].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, 4)
    },
  })

  return (
    <div className="container space-y-12 py-12">
      {/* Hero */}
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Welcome to NerdHub</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your central hub for games, quotes, and community tools.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild>
            <Link to="/games">Browse Games</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/about">About</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Quote of the Day */}
        <section>
          <h2 className="mb-4 text-2xl font-bold tracking-tight">Quote of the Day</h2>
          <Card className="h-full">
            <CardContent className="flex h-full flex-col justify-center p-6">
              {quote ? (
                <>
                  <blockquote className="border-l-2 pl-4 italic text-lg text-muted-foreground">
                    "{quote.quoteText}"
                  </blockquote>
                  <div className="mt-4 text-right">
                    <p className="font-semibold">- {quote.quotedPersons.join(', ')}</p>
                    <p className="text-sm text-muted-foreground">
                      Submitted by {quote.submitter}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">Loading quote...</div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Quick Links / Community */}
        <section>
          <h2 className="mb-4 text-2xl font-bold tracking-tight">Community</h2>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Nerds Tools</CardTitle>
              <CardDescription>Quick access to our community resources.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Button variant="secondary" asChild className="w-full justify-start">
                <a href="URLTOCALENDAR" target="_blank" rel="noreferrer">TheNerds Calendar</a>
              </Button>
              <Button variant="secondary" asChild className="w-full justify-start">
                <a href="URLTOFILESHARE" target="_blank" rel="noreferrer">File Sharing</a>
              </Button>
              <Button variant="secondary" asChild className="w-full justify-start">
                <a href="URLTOKB" target="_blank" rel="noreferrer">Knowledge Base</a>
              </Button>
              <Button variant="secondary" asChild className="w-full justify-start">
                <a href="URLTOBRACKETMAKER" target="_blank" rel="noreferrer">Bracket Maker</a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Featured Games */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Featured Games</h2>
          <Button variant="ghost" asChild>
            <Link to="/games">View all games &rarr;</Link>
          </Button>
        </div>
        
        {games ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((game) => (
              <Card key={game.appid} className="overflow-hidden flex flex-col transition-colors hover:bg-muted/50">
                <div className="aspect-[460/215] w-full bg-muted">
                  {game.headerImage && (
                    <img 
                      src={game.headerImage} 
                      alt={game.name} 
                      className="h-full w-full object-cover" 
                      loading="lazy"
                    />
                  )}
                </div>
                <CardHeader className="p-4 flex-1">
                  <CardTitle className="line-clamp-1 text-base">{game.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">
                    {game.shortDescription || 'No description available.'}
                  </CardDescription>
                </CardHeader>
                <div className="p-4 pt-0 mt-auto flex items-center justify-between">
                  <Badge variant={game.isFree ? 'secondary' : 'default'}>
                    {game.priceOverview?.finalFormatted || (game.isFree ? 'Free' : 'N/A')}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/games/${game.appid}`}>Details</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-[280px] animate-pulse bg-muted" />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
