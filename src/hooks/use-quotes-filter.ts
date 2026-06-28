import { useState, useMemo } from "react"
import { usePersistentState } from "@/hooks/use-persistent-state"
import type { Quote } from "@/lib/quote-service"

export function useQuotesFilter(quotes?: Quote[]) {
  const [groupBy, setGroupBy] = useState<"quotedPersons" | "submitter" | "channel">("quotedPersons")
  const [sortBy, setSortBy] = useState<"timestamp" | "submitter" | "quotedPersons">("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [search, setSearch] = useState("")

  const [selectedPersons, setSelectedPersons] = usePersistentState<Set<string>>("quotesPage_selectedPersons", new Set())
  const [selectedSubmitters, setSelectedSubmitters] = usePersistentState<Set<string>>("quotesPage_selectedSubmitters", new Set())
  const [selectedChannels, setSelectedChannels] = usePersistentState<Set<string>>("quotesPage_selectedChannels", new Set())
  const [dateFrom, setDateFrom] = usePersistentState("quotesPage_dateFrom", "")
  const [dateTo, setDateTo] = usePersistentState("quotesPage_dateTo", "")

  const handleSort = (key: typeof sortBy) => {
    if (sortBy === key) {
      setSortDirection(prev => prev === "desc" ? "asc" : "desc")
    } else {
      setSortBy(key)
      setSortDirection("desc")
    }
  }

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
      if (sortBy === "timestamp") {
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      } else if (sortBy === "submitter") {
        cmp = a.submitter.localeCompare(b.submitter)
      } else if (sortBy === "quotedPersons") {
        const aFirst = a.quotedPersons[0] || ""
        const bFirst = b.quotedPersons[0] || ""
        cmp = aFirst.localeCompare(bFirst)
      }
      return sortDirection === "desc" ? -cmp : cmp
    })

    return result
  }, [quotes, search, sortBy, sortDirection, selectedPersons, selectedSubmitters, selectedChannels, dateFrom, dateTo])

  const grouped = useMemo(() => {
    const groups: Record<string, typeof sortedAndFiltered> = {}
    for (const quote of sortedAndFiltered) {
      let keys: string[] = []
      if (groupBy === "quotedPersons") {
        keys = quote.quotedPersons.length > 0 ? quote.quotedPersons : ["Unknown"]
      } else if (groupBy === "channel") {
        keys = [quote.channelName || "Unknown Channel"]
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

  const clearFilters = () => {
    setSelectedPersons(new Set())
    setSelectedSubmitters(new Set())
    setSelectedChannels(new Set())
    setDateFrom("")
    setDateTo("")
  }

  return {
    groupBy, setGroupBy,
    sortBy, sortDirection, handleSort,
    search, setSearch,
    selectedPersons, setSelectedPersons,
    selectedSubmitters, setSelectedSubmitters,
    selectedChannels, setSelectedChannels,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    allPersons, allSubmitters, allChannels,
    sortedAndFiltered, grouped,
    clearFilters
  }
}
