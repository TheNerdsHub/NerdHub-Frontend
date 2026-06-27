import { useState, useMemo } from 'react'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useQuery } from '@tanstack/react-query'
import { gameService } from '@/lib/game-service'
import GameCard from '@/components/game-card'
import { Search, Gamepad2, AlertCircle, X, ArrowUpDown, ArrowUp, ArrowDown, Tags } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

type SortKey = 'name' | 'price' | 'appid' | 'owners'

export default function GamesPage() {
  useDocumentTitle('Games')

  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortKey>('owners')
  const [sortDesc, setSortDesc] = useState(true)
  const [hideNoPrice, setHideNoPrice] = useState(true)

  const { data: games, isLoading, isError } = useQuery({
    queryKey: ['games'],
    queryFn: () => gameService.getAllGames(),
  })

  const allTags = useMemo(() => {
    if (!games) return []
    const tags = new Set<string>()
    for (const g of games) {
      for (const genre of g.genres ?? []) {
        tags.add(genre.description)
      }
    }
    return Array.from(tags).sort()
  }, [games])

  const filteredGames = useMemo(() => {
    if (!games) return []

    let result = [...games]

    // Search
    if (search.trim()) {
      const lower = search.toLowerCase()
      result = result.filter((g) =>
        g.name?.toLowerCase().includes(lower) ||
        g.appid.toString().includes(lower)
      )
    }

    // Tags
    if (selectedTags.size > 0) {
      result = result.filter((g) =>
        g.genres?.some((genre) => selectedTags.has(genre.description))
      )
    }

    // Exclude N/A prices (delisted / not sold anymore)
    if (hideNoPrice) {
      result = result.filter((g) => g.priceOverview?.finalFormatted)
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'name') {
        cmp = (a.name ?? '').localeCompare(b.name ?? '')
      } else if (sortBy === 'price') {
        const aPrice = a.priceOverview?.final ?? (a.isFree ? 0 : Infinity)
        const bPrice = b.priceOverview?.final ?? (b.isFree ? 0 : Infinity)
        cmp = aPrice - bPrice
      } else if (sortBy === 'appid') {
        cmp = a.appid - b.appid
      } else if (sortBy === 'owners') {
        const aOwners = a.ownedBy?.steamId?.length ?? 0
        const bOwners = b.ownedBy?.steamId?.length ?? 0
        cmp = aOwners - bOwners
      }
      return sortDesc ? -cmp : cmp
    })

    return result
  }, [games, search, selectedTags, sortBy, sortDesc, hideNoPrice])

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'owners', label: 'Owners' },
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'appid', label: 'App ID' },
  ]

  return (
    <div className="container max-w-[1920px] mx-auto py-12 px-6 space-y-10">
      {/* Sticky header bar */}
      <div className="sticky top-0 z-30 -mx-6 px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-white/10 -mt-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Gamepad2 className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight truncate">Game Library</h1>
              <p className="text-xs text-muted-foreground font-mono truncate">{filteredGames.length} of {games?.length ?? 0} titles</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64 group">
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-accent transition-colors shadow-inner">
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input
                  type="search"
                  placeholder="SEARCH..."
                  className="w-full bg-transparent border-none pl-10 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl px-2 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {sortOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      if (sortBy === opt.key) {
                        setSortDesc(!sortDesc)
                      } else {
                        setSortBy(opt.key)
                        setSortDesc(false)
                      }
                    }}
                    className={`flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-lg transition-colors ${
                      sortBy === opt.key
                        ? 'bg-accent/20 text-accent'
                        : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    {opt.label}
                    {sortBy === opt.key && (
                      sortDesc ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>

              {/* Exclude N/A prices toggle */}
              <button
                onClick={() => setHideNoPrice(!hideNoPrice)}
                title="Hide games that are no longer sold on Steam and have no pricing data available."
                className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-colors ${
                  hideNoPrice
                    ? 'bg-destructive/20 border-destructive/40 text-destructive'
                    : 'bg-black/40 border-white/10 text-muted-foreground hover:text-white'
                }`}
              >
                {hideNoPrice ? 'Excluding N/A Prices' : 'Exclude N/A Prices'}
              </button>
            </div>
          </div>
        </div>

        {/* Tags dropdown */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 transition-colors">
                  <Tags className="w-3.5 h-3.5" />
                  Tags{selectedTags.size > 0 && <span className="text-primary">({selectedTags.size})</span>}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-72 bg-[#141414] border-white/10 font-mono text-xs">
                {selectedTags.size > 0 && (
                  <>
                    <button
                      onClick={() => setSelectedTags(new Set())}
                      className="flex items-center gap-2 w-full px-2 py-1.5 text-muted-foreground hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" /> Clear all
                    </button>
                    <DropdownMenuSeparator className="bg-white/10" />
                  </>
                )}
                {allTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedTags.has(tag)}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={() => {
                      const next = new Set(selectedTags)
                      if (next.has(tag)) next.delete(tag)
                      else next.add(tag)
                      setSelectedTags(next)
                    }}
                    className="text-muted-foreground data-[state=checked]:text-primary focus:text-white"
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
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
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {filteredGames.map((game) => (
              <GameCard key={game.appid} game={game} />
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