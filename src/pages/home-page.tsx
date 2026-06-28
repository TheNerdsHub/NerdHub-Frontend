import { useMemo } from 'react'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { quoteService } from '@/lib/quote-service'
import { gameService } from '@/lib/game-service'
import GameCard from '@/components/game-card'
import { Quote, CalendarDays, Share2, BookOpen, Trophy } from 'lucide-react'
import { useOwnerMap } from '@/hooks/use-owner-map'
import { GameCardSkeleton } from '@/components/game-card-skeleton'

export default function HomePage() {
  useDocumentTitle('Home')

  const { data: quote } = useQuery({
    queryKey: ['qotd'],
    queryFn: () => quoteService.getQuoteOfTheDay(),
  })

  const { data: allGames } = useQuery({
    queryKey: ['games'],
    queryFn: () => gameService.getAllGames(),
  })

  const games = useMemo(() => {
    if (!allGames) return undefined
    const withImages = allGames.filter((g) => g.headerImage)
    const scored = withImages.map((g) => {
      const ownerCount = g.ownedBy?.steamId?.length ?? 0
      const onSale = (g.priceOverview?.discountPercent ?? 0) > 0
      return { game: g, score: ownerCount + (onSale ? 100 : 0) }
    })
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, 4).map((s) => s.game)
  }, [allGames])

  const { data: userMappings } = useQuery({
    queryKey: ['user-mappings'],
    queryFn: () => gameService.getUserMappings(),
    staleTime: 5 * 60 * 1000,
  })

  const ownerMap = useOwnerMap(userMappings)

  return (
    <div className="container max-w-7xl mx-auto space-y-16 py-16 px-6">
      {/* Hero */}
      <section className="mx-auto max-w-3xl text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
          Welcome to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-sm">NerdHub</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-light">
          Your central hub for games, quotes, and community tools.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild size="lg" className="rounded-xl font-bold shadow-[0_0_15px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.6)] transition-shadow">
            <Link to="/games">Browse Games</Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="rounded-xl border-white/10 bg-black/20 backdrop-blur hover:bg-white/5 hover:text-foreground">
            <Link to="/about">System Info</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Quote of the Day */}
        <section className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
          <div className="relative glass-panel rounded-3xl p-8 h-full flex flex-col justify-center overflow-hidden">
            <Quote className="absolute -top-4 -right-4 w-32 h-32 text-white/5 group-hover:text-primary/10 transition-colors duration-500" />
            <h2 className="mb-6 text-sm font-mono text-primary">Quote of the Day</h2>
            {quote ? (
              <div className="relative z-10">
                <blockquote className="text-2xl font-serif italic text-foreground/90 leading-relaxed mb-6">
                  "{quote.quoteText}"
                </blockquote>
                <div className="flex flex-col items-end gap-1">
                  <p className="font-bold text-accent text-lg">— {quote.quotedPersons.join(', ')}</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    SYS.LOG // {quote.submitter}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground animate-pulse font-mono text-sm">
                LOADING DATA...
              </div>
            )}
          </div>
        </section>

        {/* Quick Links / Community */}
        <section className="glass-panel rounded-3xl p-8 flex flex-col">
          <h2 className="mb-2 text-sm font-mono text-accent">Network Nodes</h2>
          <p className="text-muted-foreground mb-6 text-sm">Quick access to connected community resources.</p>
          
          <div className="grid gap-4 sm:grid-cols-2 mt-auto">
            <a href="URLTOCALENDAR" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-accent/50 hover:bg-accent/10 transition-all group">
              <CalendarDays className="w-5 h-5 text-accent group-hover:shadow-[0_0_10px_hsl(var(--accent)/0.5)] rounded-full" />
              <span className="font-medium text-sm">Calendar</span>
            </a>
            <a href="URLTOFILESHARE" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/10 transition-all group">
              <Share2 className="w-5 h-5 text-primary group-hover:shadow-[0_0_10px_hsl(var(--primary)/0.5)] rounded-full" />
              <span className="font-medium text-sm">File Share</span>
            </a>
            <a href="URLTOKB" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-accent/50 hover:bg-accent/10 transition-all group">
              <BookOpen className="w-5 h-5 text-accent group-hover:shadow-[0_0_10px_hsl(var(--accent)/0.5)] rounded-full" />
              <span className="font-medium text-sm">Knowledge Base</span>
            </a>
            <a href="URLTOBRACKETMAKER" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/10 transition-all group">
              <Trophy className="w-5 h-5 text-primary group-hover:shadow-[0_0_10px_hsl(var(--primary)/0.5)] rounded-full" />
              <span className="font-medium text-sm">Bracket Maker</span>
            </a>
          </div>
        </section>
      </div>

      {/* Featured Games */}
      <section>
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Featured Games
          </h2>
          <Button variant="ghost" asChild className="hover:text-primary transition-colors text-sm font-mono">
            <Link to="/games">View All &rarr;</Link>
          </Button>
        </div>
        
        {games ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((game) => (
              <GameCard key={game.appid} game={game} ownerMap={ownerMap} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}