import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useQuery } from '@tanstack/react-query'
import { gameService } from '@/lib/game-service'
import GameCard from '@/components/game-card'
import {
  Search, Gamepad2, AlertCircle, X, ArrowUpDown, ArrowUp, ArrowDown,
  Tags, Users, List, Percent, ChevronLeft, ChevronRight, SlidersHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { motion, AnimatePresence } from 'motion/react'

type SortKey = 'name' | 'price' | 'appid' | 'owners' | 'discount' | 'lastModified'

export default function GamesPage() {
  useDocumentTitle('Games')
  const [searchParams, setSearchParams] = useSearchParams()

  const [sidebarOpen, setSidebarOpen] = useState(true)

  const search = searchParams.get('q') ?? ''
  const setSearch = (val: string) => {
    const next = new URLSearchParams(searchParams)
    if (val) next.set('q', val); else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  const selectedTags = useMemo(() => {
    const raw = searchParams.get('tags')
    return raw ? new Set(raw.split(',').filter(Boolean)) : new Set<string>()
  }, [searchParams])
  const setSelectedTags = (next: Set<string>) => {
    const p = new URLSearchParams(searchParams)
    if (next.size > 0) p.set('tags', Array.from(next).join(',')); else p.delete('tags')
    setSearchParams(p, { replace: true })
  }

  const sortBy = (searchParams.get('sort') as SortKey) ?? 'owners'
  const sortDesc = searchParams.get('dir') !== 'asc'

  const hideNoPrice = searchParams.get('noprice') !== '0'
  const setHideNoPrice = (val: boolean) => {
    const p = new URLSearchParams(searchParams)
    if (!val) p.set('noprice', '0'); else p.delete('noprice')
    setSearchParams(p, { replace: true })
  }

  const multiOwner = searchParams.get('multi') === '1'
  const setMultiOwner = (val: boolean) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set('multi', '1'); else p.delete('multi')
    setSearchParams(p, { replace: true })
  }

  const onlyOnSale = searchParams.get('sale') === '1'
  const setOnlyOnSale = (val: boolean) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set('sale', '1'); else p.delete('sale')
    setSearchParams(p, { replace: true })
  }

  const selectedOwners = useMemo(() => {
    const raw = searchParams.get('owners')
    return raw ? new Set(raw.split(',').filter(Boolean)) : new Set<string>()
  }, [searchParams])
  const setSelectedOwners = (next: Set<string>) => {
    const p = new URLSearchParams(searchParams)
    if (next.size > 0) p.set('owners', Array.from(next).join(',')); else p.delete('owners')
    setSearchParams(p, { replace: true })
  }

  const selectedCategories = useMemo(() => {
    const raw = searchParams.get('cats')
    return raw ? new Set(raw.split(',').filter(Boolean)) : new Set<string>()
  }, [searchParams])
  const setSelectedCategories = (next: Set<string>) => {
    const p = new URLSearchParams(searchParams)
    if (next.size > 0) p.set('cats', Array.from(next).join(',')); else p.delete('cats')
    setSearchParams(p, { replace: true })
  }

  useEffect(() => { localStorage.setItem('gamesPage_sortBy', sortBy) }, [sortBy])
  useEffect(() => { localStorage.setItem('gamesPage_sortDesc', String(sortDesc)) }, [sortDesc])
  useEffect(() => { localStorage.setItem('gamesPage_hideNoPrice', String(hideNoPrice)) }, [hideNoPrice])
  useEffect(() => { localStorage.setItem('gamesPage_multiOwner', String(multiOwner)) }, [multiOwner])
  useEffect(() => { localStorage.setItem('gamesPage_onlyOnSale', String(onlyOnSale)) }, [onlyOnSale])

  const { data: games, isLoading, isError } = useQuery({
    queryKey: ['games'],
    queryFn: () => gameService.getAllGames(),
  })

  const { data: userMappings } = useQuery({
    queryKey: ['user-mappings'],
    queryFn: () => gameService.getUserMappings(),
    staleTime: 5 * 60 * 1000,
  })

  const ownerMap = useMemo(() => {
    if (!userMappings) return undefined
    const map: Record<string, string> = {}
    for (const u of userMappings) {
      map[u.steamId] = u.nickname || u.username
    }
    return map
  }, [userMappings])

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

  const allOwners = useMemo(() => {
    if (!games || !userMappings) return []
    const steamIds = new Set(games.flatMap((g) => g.ownedBy?.steamId || []))
    return Array.from(steamIds)
      .map((sid) => {
        const user = userMappings.find(u => u.steamId === sid)
        return { value: sid, label: user ? (user.nickname || user.username) : sid }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [games, userMappings])

  const allCategories = useMemo(() => {
    if (!games) return []
    const cats = new Set<string>()
    for (const g of games) {
      for (const cat of g.categories ?? []) {
        cats.add(cat.description)
      }
    }
    return Array.from(cats).sort()
  }, [games])

  const filteredGames = useMemo(() => {
    if (!games) return []

    let result = [...games]

    if (search.trim()) {
      const lower = search.toLowerCase()
      result = result.filter((g) =>
        g.name?.toLowerCase().includes(lower) ||
        g.appid.toString().includes(lower)
      )
    }

    if (selectedTags.size > 0) {
      result = result.filter((g) =>
        g.genres?.some((genre) => selectedTags.has(genre.description))
      )
    }

    if (selectedCategories.size > 0) {
      result = result.filter((g) =>
        g.categories?.some((cat) => selectedCategories.has(cat.description))
      )
    }

    if (selectedOwners.size > 0) {
      result = result.filter((g) =>
        Array.from(selectedOwners).every((owner) =>
          g.ownedBy?.steamId?.includes(owner)
        )
      )
    }

    if (hideNoPrice) {
      result = result.filter((g) => g.priceOverview?.finalFormatted)
    }

    if (onlyOnSale) {
      result = result.filter((g) => (g.priceOverview?.discountPercent ?? 0) > 0)
    }

    if (multiOwner) {
      result = result.filter((g) => (g.ownedBy?.steamId?.length ?? 0) >= 2)
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'name') {
        cmp = (a.name ?? '').localeCompare(b.name ?? '')
      } else if (sortBy === 'price') {
        const aIsNA = a.priceOverview?.finalFormatted == null && !a.isFree
        const bIsNA = b.priceOverview?.finalFormatted == null && !b.isFree
        const aIsFree = a.isFree
        const bIsFree = b.isFree

        if (aIsNA && !bIsNA) cmp = -1
        else if (!aIsNA && bIsNA) cmp = 1
        else if (aIsFree && !bIsFree && !bIsNA) cmp = -1
        else if (!aIsFree && !aIsNA && bIsFree) cmp = 1
        else cmp = (a.priceOverview?.final ?? 0) - (b.priceOverview?.final ?? 0)
      } else if (sortBy === 'appid') {
        cmp = a.appid - b.appid
      } else if (sortBy === 'owners') {
        cmp = (a.ownedBy?.steamId?.length ?? 0) - (b.ownedBy?.steamId?.length ?? 0)
      } else if (sortBy === 'discount') {
        cmp = (a.priceOverview?.discountPercent ?? 0) - (b.priceOverview?.discountPercent ?? 0)
        if (cmp === 0) {
          cmp = (a.priceOverview?.final ?? 0) - (b.priceOverview?.final ?? 0)
        }
      } else if (sortBy === 'lastModified') {
        const timeA = a.lastModifiedTime ? new Date(a.lastModifiedTime).getTime() : 0
        const timeB = b.lastModifiedTime ? new Date(b.lastModifiedTime).getTime() : 0
        cmp = timeA - timeB
        if (cmp === 0) {
          cmp = (a.priceOverview?.final ?? 0) - (b.priceOverview?.final ?? 0)
        }
      }
      return sortDesc ? -cmp : cmp
    })

    return result
  }, [games, search, selectedTags, selectedCategories, selectedOwners, sortBy, sortDesc, hideNoPrice, multiOwner, onlyOnSale])

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'owners', label: 'Owners' },
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'discount', label: 'Discount' },
    { key: 'lastModified', label: 'Last Updated' },
    { key: 'appid', label: 'App ID' },
  ]

  const handleSort = (key: SortKey) => {
    const p = new URLSearchParams(searchParams)
    if (sortBy === key) {
      if (sortDesc) p.set('dir', 'asc'); else p.delete('dir')
    } else {
      if (key !== 'owners') p.set('sort', key); else p.delete('sort')
      p.delete('dir')
    }
    setSearchParams(p, { replace: true })
  }

  const filterButtons = (
    <>
      <button
        onClick={() => setHideNoPrice(!hideNoPrice)}
        title="Hide games that are no longer sold on Steam and have no pricing data available."
        className={`text-[10px] font-mono px-3 py-1.5 rounded-xl border transition-colors text-left ${
          hideNoPrice
            ? 'bg-destructive/20 border-destructive/40 text-destructive'
            : 'bg-black/40 border-white/10 text-muted-foreground hover:text-white'
        }`}
      >
        {hideNoPrice ? 'Excluding N/A Prices' : 'Exclude N/A Prices'}
      </button>

      <button
        onClick={() => setOnlyOnSale(!onlyOnSale)}
        title="Only show games that are currently on sale."
        className={`flex items-center gap-1.5 text-[10px] font-mono px-3 py-1.5 rounded-xl border transition-colors text-left ${
          onlyOnSale
            ? 'bg-accent/20 border-accent/40 text-accent'
            : 'bg-black/40 border-white/10 text-muted-foreground hover:text-white'
        }`}
      >
        <Percent className="w-3 h-3" />
        {onlyOnSale ? 'On Sale' : 'On Sale'}
      </button>

      <button
        onClick={() => setMultiOwner(!multiOwner)}
        title="Only show games owned by 2+ agents."
        className={`text-[10px] font-mono px-3 py-1.5 rounded-xl border transition-colors text-left ${
          multiOwner
            ? 'bg-accent/20 border-accent/40 text-accent'
            : 'bg-black/40 border-white/10 text-muted-foreground hover:text-white'
        }`}
      >
        {multiOwner ? '2+ Owners' : '2+ Owners'}
      </button>
    </>
  )

  const sortPills = (
    <div className="flex items-center gap-1 flex-wrap bg-black/40 border border-white/10 rounded-xl px-2 py-1.5">
      <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      {sortOptions.map((opt) => (
        <button
          key={opt.key}
          onClick={() => handleSort(opt.key)}
          className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-lg transition-colors ${
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
  )

  const tagDropdown = allTags.length > 0 && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 transition-colors w-full">
          <Tags className="w-3.5 h-3.5" />
          {selectedTags.size > 0 ? `${selectedTags.size} selected` : 'All Tags'}
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
  )

  const ownerDropdown = allOwners.length > 0 && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 transition-colors w-full">
          <Users className="w-3.5 h-3.5" />
          {selectedOwners.size > 0 ? `${selectedOwners.size} selected` : 'All Owners'}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 bg-[#141414] border-white/10 font-mono text-xs">
        {selectedOwners.size > 0 && (
          <>
            <button
              onClick={() => setSelectedOwners(new Set())}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
            <DropdownMenuSeparator className="bg-white/10" />
          </>
        )}
        {allOwners.map((owner) => (
          <DropdownMenuCheckboxItem
            key={owner.value}
            checked={selectedOwners.has(owner.value)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() => {
              const next = new Set(selectedOwners)
              if (next.has(owner.value)) next.delete(owner.value)
              else next.add(owner.value)
              setSelectedOwners(next)
            }}
            className="text-muted-foreground data-[state=checked]:text-primary focus:text-white"
          >
            {owner.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const categoryDropdown = allCategories.length > 0 && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 transition-colors w-full">
          <List className="w-3.5 h-3.5" />
          {selectedCategories.size > 0 ? `${selectedCategories.size} selected` : 'All Categories'}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 bg-[#141414] border-white/10 font-mono text-xs">
        {selectedCategories.size > 0 && (
          <>
            <button
              onClick={() => setSelectedCategories(new Set())}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
            <DropdownMenuSeparator className="bg-white/10" />
          </>
        )}
        {allCategories.map((cat) => (
          <DropdownMenuCheckboxItem
            key={cat}
            checked={selectedCategories.has(cat)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() => {
              const next = new Set(selectedCategories)
              if (next.has(cat)) next.delete(cat)
              else next.add(cat)
              setSelectedCategories(next)
            }}
            className="text-muted-foreground data-[state=checked]:text-primary focus:text-white"
          >
            {cat}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const controlsPanel = (
    <div className="space-y-6">
      <div className="relative group">
        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
        <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-accent transition-colors shadow-inner">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <input
            type="search"
            placeholder="Search games..."
            className="w-full bg-transparent border-none pl-10 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {sortPills}

      <div className="flex flex-col gap-2">
        {filterButtons}
      </div>

      {tagDropdown}

      {ownerDropdown}

      {categoryDropdown}
    </div>
  )

  return (
    <motion.div layout className="py-12 px-6 flex gap-6 items-start">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 288 : 56 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="hidden lg:block glass-panel rounded-2xl overflow-hidden shrink-0 sticky top-12 self-start"
      >
        <motion.div layout transition={{ duration: 0.3 }}>
          <div className="flex items-center justify-between p-3">
            {sidebarOpen && (
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Menu</span>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-white"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence mode="popLayout">
          {sidebarOpen ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="p-4 pt-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Gamepad2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-black tracking-tight truncate">Game Library</h2>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {filteredGames.length !== games?.length
                        ? `${filteredGames.length} / ${games?.length ?? 0}`
                        : `${games?.length ?? 0}`} Games
                    </p>
                  </div>
                </div>

                {controlsPanel}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex flex-col items-center gap-4 py-4 px-1">
                <div title="Search"><Search className="w-4 h-4 text-muted-foreground" /></div>
                <div title="Sort"><ArrowUpDown className="w-4 h-4 text-muted-foreground" /></div>
                <div title="Filters"><Percent className="w-4 h-4 text-muted-foreground" /></div>
                <div title="Tags"><Tags className="w-4 h-4 text-muted-foreground" /></div>
                <div title="Owners"><Users className="w-4 h-4 text-muted-foreground" /></div>
                <div title="Categories"><List className="w-4 h-4 text-muted-foreground" /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>
      </motion.aside>

      {/* Main content area */}
      <motion.div layout className="flex-1 min-w-0 space-y-10">
        {/* Mobile header */}
        <div className="flex lg:hidden items-center gap-3 min-w-0">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Gamepad2 className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight truncate">Game Library</h1>
            <p className="text-xs text-muted-foreground font-mono truncate">
              {filteredGames.length !== games?.length
                ? `${filteredGames.length} / ${games?.length ?? 0} Games`
                : `${games?.length ?? 0} Games`}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="h-[280px] rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        )}

        {isError && (
          <div className="glass-panel border-destructive/30 bg-destructive/5 rounded-2xl p-8 text-center text-destructive flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12" />
            <p className="font-mono">System Failure: Could not connect to game database.</p>
          </div>
        )}

        {filteredGames && (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {filteredGames.map((game) => (
                <GameCard key={game.appid} game={game} ownerMap={ownerMap} />
              ))}
            </div>

            {filteredGames.length === 0 && !isLoading && (
              <div className="py-24 text-center text-muted-foreground glass-panel rounded-3xl border-dashed">
                <p className="font-mono">No records matching &ldquo;{search}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        {/* Mobile floating filter button */}
        <div className="lg:hidden fixed bottom-8 left-8 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-3 rounded-2xl border border-accent/30 bg-background/80 backdrop-blur-md text-accent shadow-lg transition-all duration-300 hover:border-accent hover:shadow-[0_0_20px_hsl(var(--accent)/0.3)]">
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-[#141414] border-white/10 max-h-[80vh]">
              <SheetHeader>
                <SheetTitle className="text-white font-mono text-sm">Filters & Sort</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto py-4">
                {controlsPanel}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </motion.div>
    </motion.div>
  )
}
