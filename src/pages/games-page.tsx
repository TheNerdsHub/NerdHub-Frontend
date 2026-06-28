import { useEffect, useMemo, useState } from 'react'

import { useDocumentTitle } from '@/hooks/use-document-title'
import { useQuery } from '@tanstack/react-query'
import { gameService } from '@/lib/game-service'
import GameCard from '@/components/game-card'
import {
  Search, Gamepad2, AlertCircle, X, ArrowUpDown, ArrowUp, ArrowDown,
  Tags, Users, List, Percent,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { FilterBar } from '@/components/ui/filter-bar'
import SidebarLayout from '@/components/ui/sidebar-layout'

type SortKey = 'name' | 'price' | 'appid' | 'owners' | 'discount' | 'lastModified'

export default function GamesPage() {
  useDocumentTitle('Games')

  const [search, setSearch] = useState(() => localStorage.getItem('gamesPage_q') ?? '')
  useEffect(() => { localStorage.setItem('gamesPage_q', search) }, [search])

  const [selectedTags, setSelectedTags] = useState<Set<string>>(() => {
    const raw = localStorage.getItem('gamesPage_tags')
    return raw ? new Set(raw.split(',').filter(Boolean)) : new Set<string>()
  })
  useEffect(() => { localStorage.setItem('gamesPage_tags', Array.from(selectedTags).join(',')) }, [selectedTags])

  const [sortBy, setSortBy] = useState<SortKey>(() => (localStorage.getItem('gamesPage_sortBy') as SortKey) ?? 'owners')
  useEffect(() => { localStorage.setItem('gamesPage_sortBy', sortBy) }, [sortBy])

  const [sortDesc, setSortDesc] = useState(() => localStorage.getItem('gamesPage_sortDesc') !== 'false')
  useEffect(() => { localStorage.setItem('gamesPage_sortDesc', String(sortDesc)) }, [sortDesc])

  const [hideNoPrice, setHideNoPrice] = useState(() => localStorage.getItem('gamesPage_hideNoPrice') !== 'false')
  useEffect(() => { localStorage.setItem('gamesPage_hideNoPrice', String(hideNoPrice)) }, [hideNoPrice])

  const [multiOwner, setMultiOwner] = useState(() => localStorage.getItem('gamesPage_multiOwner') === 'true')
  useEffect(() => { localStorage.setItem('gamesPage_multiOwner', String(multiOwner)) }, [multiOwner])

  const [onlyOnSale, setOnlyOnSale] = useState(() => localStorage.getItem('gamesPage_onlyOnSale') === 'true')
  useEffect(() => { localStorage.setItem('gamesPage_onlyOnSale', String(onlyOnSale)) }, [onlyOnSale])

  const [selectedOwners, setSelectedOwners] = useState<Set<string>>(() => {
    const raw = localStorage.getItem('gamesPage_owners')
    return raw ? new Set(raw.split(',').filter(Boolean)) : new Set<string>()
  })
  useEffect(() => { localStorage.setItem('gamesPage_owners', Array.from(selectedOwners).join(',')) }, [selectedOwners])

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => {
    const raw = localStorage.getItem('gamesPage_cats')
    return raw ? new Set(raw.split(',').filter(Boolean)) : new Set<string>()
  })
  useEffect(() => { localStorage.setItem('gamesPage_cats', Array.from(selectedCategories).join(',')) }, [selectedCategories])

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
    if (sortBy === key) {
      setSortDesc(!sortDesc)
    } else {
      setSortBy(key)
      setSortDesc(true)
    }
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
    <FilterBar>
      <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      {sortOptions.map((opt) => (
        <FilterBar.Pill
          key={opt.key}
          active={sortBy === opt.key}
          onClick={() => handleSort(opt.key)}
        >
          {opt.label}
          {sortBy === opt.key && (
            sortDesc ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
          )}
        </FilterBar.Pill>
      ))}
    </FilterBar>
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
    <SidebarLayout
      icon={<Gamepad2 className="w-5 h-5 text-primary" />}
      iconContainerClass="bg-primary/10"
      title="Game Library"
      subtitle={`${filteredGames.length !== games?.length ? `${filteredGames.length} / ${games?.length ?? 0}` : `${games?.length ?? 0}`} Games`}
      controlsPanel={controlsPanel}
      mainContent={
        <>
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
        </>
      }
      collapsedSections={[
        { icon: <Search className="w-4 h-4 text-muted-foreground" />, label: 'Search' },
        { icon: <ArrowUpDown className="w-4 h-4 text-muted-foreground" />, label: 'Sort' },
        { icon: <Percent className="w-4 h-4 text-muted-foreground" />, label: 'Filters' },
        { icon: <Tags className="w-4 h-4 text-muted-foreground" />, label: 'Tags' },
        { icon: <Users className="w-4 h-4 text-muted-foreground" />, label: 'Owners' },
        { icon: <List className="w-4 h-4 text-muted-foreground" />, label: 'Categories' },
      ]}
      mobileIcon={<Gamepad2 className="w-5 h-5 text-primary" />}
      mobileIconContainerClass="bg-primary/10"
      mobileTitle="Game Library"
      mobileSubtitle={`${filteredGames.length !== games?.length ? `${filteredGames.length} / ${games?.length ?? 0}` : `${games?.length ?? 0}`} Games`}
      storageKey="games"
    />
  )
}
