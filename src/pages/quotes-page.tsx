import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quoteService } from '@/lib/quote-service'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { FilterBar } from '@/components/ui/filter-bar'
import SidebarLayout from '@/components/ui/sidebar-layout'
import { Search, Quote as QuoteIcon, Calendar, User, Trash2, ArrowUp, ArrowDown, ArrowUpDown, Hash, Layers, X } from 'lucide-react'

export default function QuotesPage() {
  useDocumentTitle('Quotes')
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const viewMode = searchParams.get('view') ?? 'cards'
  const setViewMode = (val: string) => {
    const p = new URLSearchParams(searchParams)
    if (val !== 'cards') p.set('view', val); else p.delete('view')
    setSearchParams(p, { replace: true })
  }

  const [groupBy, setGroupBy] = useState<'quotedPersons' | 'submitter' | 'channel'>('quotedPersons')
  const [sortBy, setSortBy] = useState<'timestamp' | 'submitter' | 'quotedPersons'>('timestamp')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const handleSort = (key: typeof sortBy) => {
    if (sortBy === key) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(key)
      setSortDirection('desc')
    }
  }
  const [search, setSearch] = useState('')

  const [selectedPersons, setSelectedPersons] = useState<Set<string>>(() => {
    const raw = localStorage.getItem('quotesPage_selectedPersons')
    return raw ? new Set(raw.split(',').filter(Boolean)) : new Set<string>()
  })
  useEffect(() => { localStorage.setItem('quotesPage_selectedPersons', Array.from(selectedPersons).join(',')) }, [selectedPersons])

  const [selectedSubmitters, setSelectedSubmitters] = useState<Set<string>>(() => {
    const raw = localStorage.getItem('quotesPage_selectedSubmitters')
    return raw ? new Set(raw.split(',').filter(Boolean)) : new Set<string>()
  })
  useEffect(() => { localStorage.setItem('quotesPage_selectedSubmitters', Array.from(selectedSubmitters).join(',')) }, [selectedSubmitters])

  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(() => {
    const raw = localStorage.getItem('quotesPage_selectedChannels')
    return raw ? new Set(raw.split(',').filter(Boolean)) : new Set<string>()
  })
  useEffect(() => { localStorage.setItem('quotesPage_selectedChannels', Array.from(selectedChannels).join(',')) }, [selectedChannels])

  const [dateFrom, setDateFrom] = useState(() => localStorage.getItem('quotesPage_dateFrom') ?? '')
  useEffect(() => { localStorage.setItem('quotesPage_dateFrom', dateFrom) }, [dateFrom])

  const [dateTo, setDateTo] = useState(() => localStorage.getItem('quotesPage_dateTo') ?? '')
  useEffect(() => { localStorage.setItem('quotesPage_dateTo', dateTo) }, [dateTo])

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quoteService.getAllQuotes(),
  })

  const allPersons = useMemo(() => {
    if (!quotes) return []
    return [...new Set(quotes.flatMap(q => q.quotedPersons))].sort()
  }, [quotes])

  const allSubmitters = useMemo(() => {
    if (!quotes) return []
    return [...new Set(quotes.map(q => q.submitter))].sort()
  }, [quotes])

  const allChannels = useMemo(() => {
    if (!quotes) return []
    const channels = new Set<string>()
    for (const q of quotes) {
      if (q.channelName) channels.add(q.channelName)
    }
    return Array.from(channels).sort()
  }, [quotes])

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quoteService.deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    },
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      deleteMutation.mutate(id)
    }
  }

  const sortedAndFiltered = useMemo(() => {
    if (!quotes) return []
    let result = [...quotes]

    if (selectedPersons.size > 0) {
      result = result.filter(q => q.quotedPersons.some(p => selectedPersons.has(p)))
    }

    if (selectedSubmitters.size > 0) {
      result = result.filter(q => selectedSubmitters.has(q.submitter))
    }

    if (selectedChannels.size > 0) {
      result = result.filter(q => q.channelName && selectedChannels.has(q.channelName))
    }

    if (dateFrom) {
      const from = new Date(dateFrom)
      result = result.filter(q => new Date(q.timestamp) >= from)
    }

    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      result = result.filter(q => new Date(q.timestamp) <= to)
    }

    if (search.trim()) {
      const lower = search.toLowerCase()
      result = result.filter((q) =>
        q.quoteText.toLowerCase().includes(lower) ||
        q.quotedPersons.some((p) => p.toLowerCase().includes(lower)) ||
        q.submitter.toLowerCase().includes(lower)
      )
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'timestamp') {
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      } else if (sortBy === 'submitter') {
        cmp = a.submitter.localeCompare(b.submitter)
      } else if (sortBy === 'quotedPersons') {
        const aFirst = a.quotedPersons[0] || ''
        const bFirst = b.quotedPersons[0] || ''
        cmp = aFirst.localeCompare(bFirst)
      }
      return sortDirection === 'desc' ? -cmp : cmp
    })

    return result
  }, [quotes, search, sortBy, sortDirection, selectedPersons, selectedSubmitters, selectedChannels, dateFrom, dateTo])

  const grouped = useMemo(() => {
    const groups: Record<string, typeof sortedAndFiltered> = {}
    for (const quote of sortedAndFiltered) {
      let keys: string[] = []
      if (groupBy === 'quotedPersons') {
        keys = quote.quotedPersons.length > 0 ? quote.quotedPersons : ['Unknown']
      } else if (groupBy === 'channel') {
        keys = [quote.channelName || 'Unknown Channel']
      } else {
        keys = [quote.submitter]
      }
      for (const key of keys) {
        if (!groups[key]) groups[key] = []
        groups[key].push(quote)
      }
    }
    return groups
  }, [sortedAndFiltered, groupBy])

  const EmptyState = () => (
    <div className="py-24 text-center text-muted-foreground glass-panel rounded-3xl border-dashed flex flex-col items-center gap-4">
      <QuoteIcon className="w-12 h-12 text-muted-foreground/30" />
      <p className="font-mono">No matching records found.</p>
    </div>
  )

  const formatQuoteText = (quoteText: string) => {
    if (quoteText.includes(':\n') || quoteText.includes(': "')) {
      return quoteText.split('\n').map((line, i) => (
        <div key={i} className="quote-line">{line}</div>
      ))
    }
    return <>"{quoteText}"</>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
        <FilterBar.Pill active={groupBy === 'quotedPersons'} onClick={() => setGroupBy('quotedPersons')}>Person</FilterBar.Pill>
        <FilterBar.Pill active={groupBy === 'submitter'} onClick={() => setGroupBy('submitter')}>Submitter</FilterBar.Pill>
        <FilterBar.Pill active={groupBy === 'channel'} onClick={() => setGroupBy('channel')}>Channel</FilterBar.Pill>
      </FilterBar>

      <FilterBar>
        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <FilterBar.Pill active={sortBy === 'timestamp'} onClick={() => handleSort('timestamp')}>
          Time {sortBy === 'timestamp' && (sortDirection === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />)}
        </FilterBar.Pill>
        <FilterBar.Pill active={sortBy === 'submitter'} onClick={() => handleSort('submitter')}>
          Submitter {sortBy === 'submitter' && (sortDirection === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />)}
        </FilterBar.Pill>
        <FilterBar.Pill active={sortBy === 'quotedPersons'} onClick={() => handleSort('quotedPersons')}>
          Person {sortBy === 'quotedPersons' && (sortDirection === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />)}
        </FilterBar.Pill>
      </FilterBar>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 transition-colors w-full">
            <User className="w-3.5 h-3.5" />
            {selectedPersons.size > 0 ? `${selectedPersons.size} person${selectedPersons.size !== 1 ? 's' : ''}` : 'All Quotees'}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-72 bg-[#141414] border-white/10 font-mono text-xs">
          {selectedPersons.size > 0 && (
            <>
              <button
                onClick={() => setSelectedPersons(new Set())}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-3 h-3" /> Clear All
              </button>
              <DropdownMenuSeparator className="bg-white/10" />
            </>
          )}
          {allPersons.map((person) => (
            <DropdownMenuCheckboxItem
              key={person}
              checked={selectedPersons.has(person)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => {
                const next = new Set(selectedPersons)
                if (next.has(person)) next.delete(person)
                else next.add(person)
                setSelectedPersons(next)
              }}
              className="text-muted-foreground data-[state=checked]:text-primary focus:text-white"
            >
              {person}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 transition-colors w-full">
            <User className="w-3.5 h-3.5" />
            {selectedSubmitters.size > 0 ? `${selectedSubmitters.size} submitter${selectedSubmitters.size !== 1 ? 's' : ''}` : 'All Submitters'}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-72 bg-[#141414] border-white/10 font-mono text-xs">
          {selectedSubmitters.size > 0 && (
            <>
              <button
                onClick={() => setSelectedSubmitters(new Set())}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-3 h-3" /> Clear All
              </button>
              <DropdownMenuSeparator className="bg-white/10" />
            </>
          )}
          {allSubmitters.map((submitter) => (
            <DropdownMenuCheckboxItem
              key={submitter}
              checked={selectedSubmitters.has(submitter)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => {
                const next = new Set(selectedSubmitters)
                if (next.has(submitter)) next.delete(submitter)
                else next.add(submitter)
                setSelectedSubmitters(next)
              }}
              className="text-muted-foreground data-[state=checked]:text-primary focus:text-white"
            >
              {submitter}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 transition-colors w-full">
            <Hash className="w-3.5 h-3.5" />
            {selectedChannels.size > 0 ? `${selectedChannels.size} channel${selectedChannels.size !== 1 ? 's' : ''}` : 'All Channels'}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-72 bg-[#141414] border-white/10 font-mono text-xs">
          {selectedChannels.size > 0 && (
            <>
              <button
                onClick={() => setSelectedChannels(new Set())}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-3 h-3" /> Clear All
              </button>
              <DropdownMenuSeparator className="bg-white/10" />
            </>
          )}
          {allChannels.map((channel) => (
            <DropdownMenuCheckboxItem
              key={channel}
              checked={selectedChannels.has(channel)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => {
                const next = new Set(selectedChannels)
                if (next.has(channel)) next.delete(channel)
                else next.add(channel)
                setSelectedChannels(next)
              }}
              className="text-muted-foreground data-[state=checked]:text-primary focus:text-white"
            >
              {channel}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 w-full">
        <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          type="date"
          min="2020-01-01"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-black/80 text-xs font-mono text-muted-foreground focus:text-white focus:outline-none cursor-pointer rounded-md px-2 py-0.5 border border-white/10 flex-1 min-w-0 [color-scheme:dark]"
        />
        <span className="text-muted-foreground text-xs shrink-0">–</span>
        <input
          type="date"
          min="2020-01-01"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-black/80 text-xs font-mono text-muted-foreground focus:text-white focus:outline-none cursor-pointer rounded-md px-2 py-0.5 border border-white/10 flex-1 min-w-0 [color-scheme:dark]"
        />
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo('') }}
            className="text-muted-foreground hover:text-white transition-colors shrink-0"
            title="Clear dates"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {(selectedPersons.size > 0 || selectedSubmitters.size > 0 || selectedChannels.size > 0 || dateFrom || dateTo) && (
        <button
          onClick={() => {
            setSelectedPersons(new Set())
            setSelectedSubmitters(new Set())
            setSelectedChannels(new Set())
            setDateFrom('')
            setDateTo('')
          }}
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
        subtitle={`${sortedAndFiltered.length} / ${quotes?.length ?? 0} Quotes`}
        controlsPanel={controlsPanel}
        mainContent={
          <>
          <TabsContent value="cards" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                ))}
              </div>
            ) : Object.entries(grouped).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(grouped).map(([group, groupQuotes]) => (
                  <div key={group} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      <h3 className="font-mono text-sm font-bold text-primary">{group}</h3>
                      <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md">{groupQuotes.length} Quote{groupQuotes.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {groupQuotes.map((quote) => (
                        <div key={quote.id} className="glass-panel rounded-3xl p-8 flex flex-col group relative overflow-hidden transition-all duration-300 hover:border-primary/30">
                          <QuoteIcon className="absolute -top-4 -right-4 w-32 h-32 text-white/[0.02] group-hover:text-primary/[0.05] transition-colors duration-500 pointer-events-none" />

                          <div className="mb-6">
                            <QuoteIcon className="h-6 w-6 text-primary/40 mb-4 group-hover:text-primary transition-colors" />
                            <p className="text-xl font-serif italic text-white/90 leading-relaxed">
                              {formatQuoteText(quote.quoteText)}
                            </p>
                          </div>

                          <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-accent" />
                              <span className="font-bold text-accent text-sm tracking-wide">
                                {quote.quotedPersons.join(', ')}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
                              <span>Logged By: {quote.submitter}</span>
                              {quote.channelName && (
                                <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                                  <Hash className="h-3 w-3" />
                                  {quote.channelName}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                                <Calendar className="h-3 w-3" />
                                {new Date(quote.timestamp).toLocaleString('en-US', { month: 'numeric', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).replace(',', '')}
                              </span>
                              <button
                                onClick={() => handleDelete(quote.id!)}
                                className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                                title="Delete quote"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value="table">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).length > 0 ? (
                  Object.entries(grouped).map(([group, groupQuotes]) => (
                    <div key={group} className="glass-panel rounded-3xl overflow-hidden">
                      <div className="px-6 py-3 border-b border-white/10 bg-black/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-primary" />
                          <h3 className="font-mono text-sm font-bold text-primary">{group}</h3>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md">{groupQuotes.length} Quote{groupQuotes.length !== 1 ? 's' : ''}</span>
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
                          {groupQuotes.map((quote) => (
                            <TableRow key={quote.id} className="border-white/5 hover:bg-white/5 transition-colors">
                              <TableCell className="font-medium text-white/90 italic py-4">{formatQuoteText(quote.quoteText)}</TableCell>
                              <TableCell className="text-accent font-medium py-4">{quote.quotedPersons.join(', ')}</TableCell>
                              <TableCell className="py-4">
                                {quote.channelName && (
                                  <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded-md">
                                    <Hash className="w-3 h-3" />{quote.channelName}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground font-mono text-xs py-4">{quote.submitter}</TableCell>
                              <TableCell className="text-right font-mono text-xs text-muted-foreground py-4">
                                {new Date(quote.timestamp).toLocaleString('en-US', { month: 'numeric', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).replace(',', '')}
                              </TableCell>
                              <TableCell className="py-4">
                                <button
                                  onClick={() => handleDelete(quote.id!)}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                  title="Delete quote"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))
                ) : (
                  <EmptyState />
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="kanban">
            {isLoading ? (
              <div className="flex gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="min-w-[320px] h-96 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                ))}
              </div>
            ) : Object.entries(grouped).length > 0 ? (
              <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
                {Object.entries(grouped).map(([group, groupQuotes]) => (
                  <div key={group} className="min-w-[320px] max-w-[400px] flex-shrink-0">
                    <div className="glass-panel rounded-2xl p-4 space-y-3 h-full">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h3 className="font-mono text-sm font-bold text-primary truncate">{group}</h3>
                        <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md shrink-0">{groupQuotes.length}</span>
                      </div>
                      <div className="space-y-3 max-h-[65vh] overflow-y-auto">
                        {groupQuotes.map((quote) => (
                          <div key={quote.id} className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3 hover:border-primary/30 transition-colors">
                            <p className="text-sm font-serif italic text-white/90 leading-relaxed">{formatQuoteText(quote.quoteText)}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1"><User className="w-3 h-3 text-accent" />{quote.quotedPersons.join(', ')}</span>
                              {quote.channelName && (
                                <span className="inline-flex items-center gap-1"><Hash className="w-3 h-3" />{quote.channelName}</span>
                              )}
                              <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(quote.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                              <span className="text-[10px] text-muted-foreground font-mono">Logged by {quote.submitter}</span>
                              <button
                                onClick={() => handleDelete(quote.id!)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                title="Delete quote"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>
          </>
        }
        collapsedSections={[
          { icon: <Search className="w-4 h-4 text-muted-foreground" />, label: 'Search' },
          { icon: <Layers className="w-4 h-4 text-muted-foreground" />, label: 'Group' },
          { icon: <ArrowUpDown className="w-4 h-4 text-muted-foreground" />, label: 'Sort' },
          { icon: <User className="w-4 h-4 text-muted-foreground" />, label: 'Person' },
          { icon: <User className="w-4 h-4 text-muted-foreground" />, label: 'Submitter' },
          { icon: <Hash className="w-4 h-4 text-muted-foreground" />, label: 'Channel' },
          { icon: <Calendar className="w-4 h-4 text-muted-foreground" />, label: 'Date' },
        ]}
        mobileIcon={<QuoteIcon className="w-5 h-5 text-accent" />}
        mobileIconContainerClass="bg-accent/10"
        mobileTitle="Quotes"
        mobileSubtitle={`${sortedAndFiltered.length} of ${quotes?.length ?? 0} Quotes`}
        storageKey="quotes"
      />
    </Tabs>
  )
}
