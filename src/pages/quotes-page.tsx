import { useSearchParams } from "react-router-dom"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { quoteService } from "@/lib/quote-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FilterBar } from "@/components/ui/filter-bar"
import { FilterDropdown } from "@/components/ui/filter-dropdown"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { EmptyState } from "@/components/ui/empty-state"
import SidebarLayout from "@/components/ui/sidebar-layout"
import { Search, Quote as QuoteIcon, Calendar, User, ArrowUp, ArrowDown, ArrowUpDown, Hash, Layers, X } from "lucide-react"
import { useQuotesFilter } from "@/hooks/use-quotes-filter"
import { QuoteCard } from "@/components/quotes/quote-card"
import { QuoteRow } from "@/components/quotes/quote-row"
import { QuoteKanbanCard } from "@/components/quotes/quote-kanban-card"
import { QuoteCardSkeleton, QuoteRowSkeleton, QuoteKanbanSkeleton } from "@/components/quotes/quote-skeleton"

export default function QuotesPage() {
  useDocumentTitle("Quotes")
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const viewMode = searchParams.get("view") ?? "cards"
  const setViewMode = (val: string) => {
    const p = new URLSearchParams(searchParams)
    if (val !== "cards") p.set("view", val); else p.delete("view")
    setSearchParams(p, { replace: true })
  }

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => quoteService.getAllQuotes(),
  })

  const filter = useQuotesFilter(quotes)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quoteService.deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
    },
  })

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this quote?")) {
      deleteMutation.mutate(id)
    }
  }

  const controlsPanel = (
    <div className="space-y-6">
      <div className="relative group">
        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
        <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-accent transition-colors shadow-inner">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <input
            type="search"
            placeholder="Search quotes..."
            className="w-full bg-transparent border-none pl-10 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
            value={filter.search}
            onChange={(e) => filter.setSearch(e.target.value)}
          />
        </div>
      </div>

      <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl w-full">
        <TabsTrigger value="cards" className="flex-1 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-primary font-mono text-xs py-2">Grid</TabsTrigger>
        <TabsTrigger value="table" className="flex-1 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-primary font-mono text-xs py-2">Table</TabsTrigger>
        <TabsTrigger value="kanban" className="flex-1 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-primary font-mono text-xs py-2">Kanban</TabsTrigger>
      </TabsList>

      <FilterBar>
        <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <FilterBar.Pill active={filter.groupBy === "quotedPersons"} onClick={() => filter.setGroupBy("quotedPersons")}>Person</FilterBar.Pill>
        <FilterBar.Pill active={filter.groupBy === "submitter"} onClick={() => filter.setGroupBy("submitter")}>Submitter</FilterBar.Pill>
        <FilterBar.Pill active={filter.groupBy === "channel"} onClick={() => filter.setGroupBy("channel")}>Channel</FilterBar.Pill>
      </FilterBar>

      <FilterBar>
        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <FilterBar.Pill active={filter.sortBy === "timestamp"} onClick={() => filter.handleSort("timestamp")}>
          Time {filter.sortBy === "timestamp" && (filter.sortDirection === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />)}
        </FilterBar.Pill>
        <FilterBar.Pill active={filter.sortBy === "submitter"} onClick={() => filter.handleSort("submitter")}>
          Submitter {filter.sortBy === "submitter" && (filter.sortDirection === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />)}
        </FilterBar.Pill>
        <FilterBar.Pill active={filter.sortBy === "quotedPersons"} onClick={() => filter.handleSort("quotedPersons")}>
          Person {filter.sortBy === "quotedPersons" && (filter.sortDirection === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />)}
        </FilterBar.Pill>
      </FilterBar>

      <FilterDropdown
        icon={User}
        label="All Quotees"
        selected={filter.selectedPersons}
        onSelectionChange={filter.setSelectedPersons}
        options={filter.allPersons.map(p => ({ value: p, label: p }))}
      />

      <FilterDropdown
        icon={User}
        label="All Submitters"
        selected={filter.selectedSubmitters}
        onSelectionChange={filter.setSelectedSubmitters}
        options={filter.allSubmitters.map(s => ({ value: s, label: s }))}
      />

      <FilterDropdown
        icon={Hash}
        label="All Channels"
        selected={filter.selectedChannels}
        onSelectionChange={filter.setSelectedChannels}
        options={filter.allChannels.map(c => ({ value: c, label: c }))}
      />

      <DateRangePicker
        dateFrom={filter.dateFrom}
        dateTo={filter.dateTo}
        onFromChange={filter.setDateFrom}
        onToChange={filter.setDateTo}
        onClear={() => { filter.setDateFrom(""); filter.setDateTo("") }}
      />

      {(filter.selectedPersons.size > 0 || filter.selectedSubmitters.size > 0 || filter.selectedChannels.size > 0 || filter.dateFrom || filter.dateTo) && (
        <button
          onClick={filter.clearFilters}
          className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-2 rounded-xl bg-destructive/20 border border-destructive/40 text-destructive hover:bg-destructive/30 transition-colors w-full"
        >
          <X className="w-3 h-3" /> Clear All Filters
        </button>
      )}
    </div>
  )

  return (
    <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
      <SidebarLayout
        icon={<QuoteIcon className="w-5 h-5 text-accent" />}
        iconContainerClass="bg-accent/10"
        title="Quote Library"
        subtitle={`${filter.sortedAndFiltered.length} / ${quotes?.length ?? 0} Quotes`}
        controlsPanel={controlsPanel}
        mainContent={
          <>
          <TabsContent value="cards" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <QuoteCardSkeleton key={i} />)}
              </div>
            ) : Object.entries(filter.grouped).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(filter.grouped).map(([group, groupQuotes]) => (
                  <div key={group} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      <h3 className="font-mono text-sm font-bold text-primary">{group}</h3>
                      <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md">{groupQuotes.length} Quote{groupQuotes.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {groupQuotes.map(q => <QuoteCard key={q.id!} quote={q} onDelete={handleDelete} />)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={QuoteIcon} />
            )}
          </TabsContent>

          <TabsContent value="table">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => <QuoteRowSkeleton key={i} />)}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(filter.grouped).length > 0 ? (
                  Object.entries(filter.grouped).map(([group, groupQuotes]) => (
                    <div key={group} className="glass-panel rounded-3xl overflow-hidden">
                      <div className="px-6 py-3 border-b border-white/10 bg-black/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-primary" />
                          <h3 className="font-mono text-sm font-bold text-primary">{group}</h3>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md">{groupQuotes.length} Quote{groupQuotes.length !== 1 ? "s" : ""}</span>
                      </div>
                      <Table>
                        <TableHeader className="bg-black/40">
                          <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="w-[35%] font-mono text-xs">Quote</TableHead>
                            <TableHead className="font-mono text-xs">Quotee</TableHead>
                            <TableHead className="font-mono text-xs">Channel</TableHead>
                            <TableHead className="font-mono text-xs">Submitter</TableHead>
                            <TableHead className="text-right font-mono text-xs">Timestamp</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupQuotes.map(q => <QuoteRow key={q.id!} quote={q} onDelete={handleDelete} />)}
                        </TableBody>
                      </Table>
                    </div>
                  ))
                ) : (
                  <EmptyState icon={QuoteIcon} />
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="kanban">
            {isLoading ? (
              <div className="flex gap-6">
                {Array.from({ length: 3 }).map((_, i) => <QuoteKanbanSkeleton key={i} />)}
              </div>
            ) : Object.entries(filter.grouped).length > 0 ? (
              <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: "thin" }}>
                {Object.entries(filter.grouped).map(([group, groupQuotes]) => (
                  <div key={group} className="min-w-[320px] max-w-[400px] flex-shrink-0">
                    <div className="glass-panel rounded-2xl p-4 space-y-3 h-full">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h3 className="font-mono text-sm font-bold text-primary truncate">{group}</h3>
                        <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md shrink-0">{groupQuotes.length}</span>
                      </div>
                      <div className="space-y-3 max-h-[65vh] overflow-y-auto">
                        {groupQuotes.map(q => <QuoteKanbanCard key={q.id!} quote={q} onDelete={handleDelete} />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={QuoteIcon} />
            )}
          </TabsContent>
          </>
        }
        collapsedSections={[
          { icon: <Search className="w-4 h-4 text-muted-foreground" />, label: "Search" },
          { icon: <Layers className="w-4 h-4 text-muted-foreground" />, label: "Group" },
          { icon: <ArrowUpDown className="w-4 h-4 text-muted-foreground" />, label: "Sort" },
          { icon: <User className="w-4 h-4 text-muted-foreground" />, label: "Person" },
          { icon: <User className="w-4 h-4 text-muted-foreground" />, label: "Submitter" },
          { icon: <Hash className="w-4 h-4 text-muted-foreground" />, label: "Channel" },
          { icon: <Calendar className="w-4 h-4 text-muted-foreground" />, label: "Date" },
        ]}
        mobileIcon={<QuoteIcon className="w-5 h-5 text-accent" />}
        mobileIconContainerClass="bg-accent/10"
        mobileTitle="Quotes"
        mobileSubtitle={`${filter.sortedAndFiltered.length} of ${quotes?.length ?? 0} Quotes`}
        storageKey="quotes"
      />
    </Tabs>
  )
}
