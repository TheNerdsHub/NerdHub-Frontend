import { useState, useMemo } from 'react'
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
import { Search, Quote as QuoteIcon, Calendar, User, Trash2, ArrowUp, ArrowDown, Hash, Layers } from 'lucide-react'

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
  const [search, setSearch] = useState('')

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quoteService.getAllQuotes(),
  })

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
  }, [quotes, search, sortBy, sortDirection])

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

  return (
    <div className="container max-w-7xl mx-auto py-12 px-6 space-y-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/10 pb-6">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <QuoteIcon className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-4xl font-black tracking-tight truncate">Quotes</h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono truncate pl-14">{sortedAndFiltered.length} of {quotes?.length ?? 0} Quotes</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl overflow-hidden focus-within:border-primary transition-colors shadow-inner">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full bg-transparent border-none pl-12 pr-4 py-4 text-sm font-mono focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
            className="bg-black/80 text-xs font-mono text-muted-foreground focus:text-white focus:outline-none cursor-pointer rounded-md px-2 py-0.5 border border-white/10"
          >
            <option value="quotedPersons" className="bg-black text-white">Group by Person</option>
            <option value="submitter" className="bg-black text-white">Group by Submitter</option>
            <option value="channel" className="bg-black text-white">Group by Channel</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2">
          <span className="text-xs font-mono text-muted-foreground">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-black/80 text-xs font-mono text-muted-foreground focus:text-white focus:outline-none cursor-pointer rounded-md px-2 py-0.5 border border-white/10"
          >
            <option value="timestamp" className="bg-black text-white">Time</option>
            <option value="submitter" className="bg-black text-white">Submitter</option>
            <option value="quotedPersons" className="bg-black text-white">Person</option>
          </select>
          <button
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="text-muted-foreground hover:text-primary transition-colors"
            title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl">
            <TabsTrigger value="cards" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-primary font-mono text-xs px-6 py-2">Grid</TabsTrigger>
            <TabsTrigger value="table" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-primary font-mono text-xs px-6 py-2">Table</TabsTrigger>
            <TabsTrigger value="kanban" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-primary font-mono text-xs px-6 py-2">Kanban</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cards" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : sortedAndFiltered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedAndFiltered.map((quote) => (
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
      </Tabs>
    </div>
  )
}
