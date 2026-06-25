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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Quote as QuoteIcon, Calendar, User } from 'lucide-react'

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
      <div className="container flex items-center justify-center py-24 text-center">
        <div>
          <QuoteIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold">Sign in required</h2>
          <p className="mt-2 text-muted-foreground">Please sign in to view the quotes collection.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotes Collection</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage community quotes.
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search quotes, people..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Quote</TableHead>
                  <TableHead>Quoted Person(s)</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>
                      <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                      <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                      <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredQuotes.length > 0 ? (
                  filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">"{quote.quoteText}"</TableCell>
                      <TableCell>{quote.quotedPersons.join(', ')}</TableCell>
                      <TableCell>{quote.submitter}</TableCell>
                      <TableCell className="text-right">
                        {new Date(quote.timestamp).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No quotes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-48 animate-pulse bg-muted" />
              ))}
            </div>
          ) : filteredQuotes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredQuotes.map((quote) => (
                <Card key={quote.id} className="flex flex-col">
                  <CardHeader className="pb-4">
                    <QuoteIcon className="h-6 w-6 text-primary/20 mb-2" />
                    <CardTitle className="text-lg leading-relaxed font-medium">
                      "{quote.quoteText}"
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0">
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium text-foreground">
                          {quote.quotedPersons.join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>By {quote.submitter}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(quote.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
              <p>No quotes found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
