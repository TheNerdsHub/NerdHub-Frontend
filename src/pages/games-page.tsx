import { useDocumentTitle } from "@/hooks/use-document-title"
import { useQuery } from "@tanstack/react-query"
import { gameService } from "@/lib/game-service"
import GameCard from "@/components/game-card"
import { GameCardSkeleton } from "@/components/game-card-skeleton"
import {
  Search, Gamepad2, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown,
  Tags, Users, List, Percent,
} from "lucide-react"
import { FilterBar } from "@/components/ui/filter-bar"
import { FilterDropdown } from "@/components/ui/filter-dropdown"
import SidebarLayout from "@/components/ui/sidebar-layout"
import { useGamesFilter, type SortKey } from "@/hooks/use-games-filter"
import { useOwnerMap } from "@/hooks/use-owner-map"

export default function GamesPage() {
  useDocumentTitle("Games")

  const { data: games, isLoading, isError } = useQuery({
    queryKey: ["games"],
    queryFn: () => gameService.getAllGames(),
  })

  const { data: userMappings } = useQuery({
    queryKey: ["user-mappings"],
    queryFn: () => gameService.getUserMappings(),
    staleTime: 5 * 60 * 1000,
  })

  const ownerMap = useOwnerMap(userMappings)
  const filter = useGamesFilter(games, userMappings)

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "owners", label: "Owners" },
    { key: "name", label: "Name" },
    { key: "price", label: "Price" },
    { key: "discount", label: "Discount" },
    { key: "lastModified", label: "Last Updated" },
    { key: "appid", label: "App ID" },
  ]

  const filterButtons = (
    <>
      <button
        onClick={() => filter.setHideNoPrice(!filter.hideNoPrice)}
        title="Hide games that are no longer sold on Steam and have no pricing data available."
        className={`text-[10px] font-mono px-3 py-1.5 rounded-xl border transition-colors text-left ${
          filter.hideNoPrice
            ? "bg-destructive/20 border-destructive/40 text-destructive"
            : "bg-black/40 border-white/10 text-muted-foreground hover:text-white"
        }`}
      >
        {filter.hideNoPrice ? "Excluding N/A Prices" : "Exclude N/A Prices"}
      </button>

      <button
        onClick={() => filter.setOnlyOnSale(!filter.onlyOnSale)}
        title="Only show games that are currently on sale."
        className={`flex items-center gap-1.5 text-[10px] font-mono px-3 py-1.5 rounded-xl border transition-colors text-left ${
          filter.onlyOnSale
            ? "bg-accent/20 border-accent/40 text-accent"
            : "bg-black/40 border-white/10 text-muted-foreground hover:text-white"
        }`}
      >
        <Percent className="w-3 h-3" />
        {filter.onlyOnSale ? "On Sale" : "On Sale"}
      </button>

      <button
        onClick={() => filter.setMultiOwner(!filter.multiOwner)}
        title="Only show games owned by 2+ agents."
        className={`text-[10px] font-mono px-3 py-1.5 rounded-xl border transition-colors text-left ${
          filter.multiOwner
            ? "bg-accent/20 border-accent/40 text-accent"
            : "bg-black/40 border-white/10 text-muted-foreground hover:text-white"
        }`}
      >
        {filter.multiOwner ? "2+ Owners" : "2+ Owners"}
      </button>
    </>
  )

  const sortPills = (
    <FilterBar>
      <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      {sortOptions.map((opt) => (
        <FilterBar.Pill
          key={opt.key}
          active={filter.sortBy === opt.key}
          onClick={() => filter.handleSort(opt.key)}
        >
          {opt.label}
          {filter.sortBy === opt.key && (
            filter.sortDesc ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
          )}
        </FilterBar.Pill>
      ))}
    </FilterBar>
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
            value={filter.search}
            onChange={(e) => filter.setSearch(e.target.value)}
          />
        </div>
      </div>

      {sortPills}

      <div className="flex flex-col gap-2">
        {filterButtons}
      </div>

      <FilterDropdown
        icon={Tags}
        label="All Tags"
        selected={filter.selectedTags}
        onSelectionChange={filter.setSelectedTags}
        options={filter.allTags.map(t => ({ value: t, label: t }))}
      />

      <FilterDropdown
        icon={Users}
        label="All Owners"
        selected={filter.selectedOwners}
        onSelectionChange={filter.setSelectedOwners}
        options={filter.allOwners.map(o => ({ value: o.value, label: o.label }))}
      />

      <FilterDropdown
        icon={List}
        label="All Categories"
        selected={filter.selectedCategories}
        onSelectionChange={filter.setSelectedCategories}
        options={filter.allCategories.map(c => ({ value: c, label: c }))}
      />
    </div>
  )

  return (
    <SidebarLayout
      icon={<Gamepad2 className="w-5 h-5 text-primary" />}
      iconContainerClass="bg-primary/10"
      title="Game Library"
      subtitle={`${filter.filteredGames.length !== games?.length ? `${filter.filteredGames.length} / ${games?.length ?? 0}` : `${games?.length ?? 0}`} Games`}
      controlsPanel={controlsPanel}
      mainContent={
        <>
          {isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 18 }).map((_, i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          )}

          {isError && (
            <div className="glass-panel border-destructive/30 bg-destructive/5 rounded-2xl p-8 text-center text-destructive flex flex-col items-center gap-4">
              <AlertCircle className="w-12 h-12" />
              <p className="font-mono">System Failure: Could not connect to game database.</p>
            </div>
          )}

          {filter.filteredGames && (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {filter.filteredGames.map((game) => (
                  <GameCard key={game.appid} game={game} ownerMap={ownerMap} />
                ))}
              </div>

              {filter.filteredGames.length === 0 && !isLoading && (
                <div className="py-24 text-center text-muted-foreground glass-panel rounded-3xl border-dashed">
                  <p className="font-mono">No records matching &ldquo;{filter.search}&rdquo;</p>
                </div>
              )}
            </div>
          )}
        </>
      }
      collapsedSections={[
        { icon: <Search className="w-4 h-4 text-muted-foreground" />, label: "Search" },
        { icon: <ArrowUpDown className="w-4 h-4 text-muted-foreground" />, label: "Sort" },
        { icon: <Percent className="w-4 h-4 text-muted-foreground" />, label: "Filters" },
        { icon: <Tags className="w-4 h-4 text-muted-foreground" />, label: "Tags" },
        { icon: <Users className="w-4 h-4 text-muted-foreground" />, label: "Owners" },
        { icon: <List className="w-4 h-4 text-muted-foreground" />, label: "Categories" },
      ]}
      mobileIcon={<Gamepad2 className="w-5 h-5 text-primary" />}
      mobileIconContainerClass="bg-primary/10"
      mobileTitle="Game Library"
      mobileSubtitle={`${filter.filteredGames.length !== games?.length ? `${filter.filteredGames.length} / ${games?.length ?? 0}` : `${games?.length ?? 0}`} Games`}
      storageKey="games"
    />
  )
}
