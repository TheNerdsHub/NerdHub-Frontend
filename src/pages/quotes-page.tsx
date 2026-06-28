import { useState, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useQuery } from '@tanstack/react-query'
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
import { Search, Quote as QuoteIcon, Calendar, User, ShieldAlert } from 'lucide-react'

export default function QuotesPage() {
  useDocumentTitle('Quotes')
  const { isAuthenticated } = useAuth()
  const [search, setSearch] = useState('')

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quoteService.getAllQuotes(),
    enabled: isAuthenticated,
  })

  const filteredQuotes = useMemo(() => {
    if (!quotes) return []
    if (!search.trim()) return quotes

    const lower = search.toLowerCase()
    return quotes.filter((q) =>
      q.quoteText.toLowerCase().includes(lower) ||
      q.quotedPersons.some((p) => p.toLowerCase().includes(lower)) ||
      q.submitter.toLowerCase().includes(lower)
    )
  }, [quotes, search])

  if (!isAuthenticated) {
    return (
      <div className="container max-w-7xl mx-auto py-24 flex items-center justify-center">
        <div className="glass-panel border-primary/30 bg-primary/5 rounded-3xl p-12 inline-flex flex-col items-center gap-6 text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-primary animate-pulse" />
          <h2 className="text-3xl font-black tracking-tight text-white">Access Denied</h2>
          <p className="text-muted-foreground font-mono text-sm">
            Authentication required to view system logs. Please sign in to proceed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto py-12 px-6 space-y-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <QuoteIcon className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">Audio Logs</h1>
          </div>
          <p className="text-muted-foreground font-light text-lg">
            Intercepted communication records from the network.
          </p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl overflow-hidden focus-within:border-primary transition-colors shadow-inner">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="search"
              placeholder="SEARCH LOGS..."
              className="w-full bg-transparent border-none pl-12 pr-4 py-4 text-sm font-mono focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="cards" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl">
            <TabsTrigger value="cards" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-primary font-mono text-xs px-6 py-2">Grid</TabsTrigger>
            <TabsTrigger value="table" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-primary font-mono text-xs px-6 py-2">Table</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cards" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : filteredQuotes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredQuotes.map((quote) => (
                <div key={quote.id} className="glass-panel rounded-3xl p-8 flex flex-col group relative overflow-hidden transition-all duration-300 hover:border-primary/30">
                  <QuoteIcon className="absolute -top-4 -right-4 w-32 h-32 text-white/[0.02] group-hover:text-primary/[0.05] transition-colors duration-500 pointer-events-none" />
                  
                  <div className="mb-6">
                    <QuoteIcon className="h-6 w-6 text-primary/40 mb-4 group-hover:text-primary transition-colors" />
                    <p className="text-xl font-serif italic text-white/90 leading-relaxed">
                      "{quote.quoteText}"
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-accent" />
                      <span className="font-bold text-accent text-sm tracking-wide">
                        {quote.quotedPersons.join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
                      <span>Logged By: {quote.submitter}</span>
                      <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                        <Calendar className="h-3 w-3" />
                        {new Date(quote.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-muted-foreground glass-panel rounded-3xl border-dashed flex flex-col items-center gap-4">
              <QuoteIcon className="w-12 h-12 text-muted-foreground/30" />
              <p className="font-mono">No matching records found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="table">
          <div className="glass-panel rounded-3xl overflow-hidden">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="w-[50%] font-mono text-xs">Audio Transcript</TableHead>
                  <TableHead className="font-mono text-xs">Subject(s)</TableHead>
                  <TableHead className="font-mono text-xs">Intercepted By</TableHead>
                  <TableHead className="text-right font-mono text-xs">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell><div className="h-4 w-3/4 animate-pulse rounded bg-white/10" /></TableCell>
                      <TableCell><div className="h-4 w-24 animate-pulse rounded bg-white/10" /></TableCell>
                      <TableCell><div className="h-4 w-24 animate-pulse rounded bg-white/10" /></TableCell>
                      <TableCell><div className="h-4 w-24 animate-pulse rounded bg-white/10 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredQuotes.length > 0 ? (
                  filteredQuotes.map((quote) => (
                    <TableRow key={quote.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white/90 italic py-4">"{quote.quoteText}"</TableCell>
                      <TableCell className="text-accent font-medium py-4">{quote.quotedPersons.join(', ')}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs py-4">{quote.submitter}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground py-4">
                        {new Date(quote.timestamp).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-mono">
                      No records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}