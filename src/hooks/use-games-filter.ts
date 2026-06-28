import { useMemo } from "react"
import { usePersistentState } from "@/hooks/use-persistent-state"
import type { GameDetails, UserMapping } from "@/lib/game-service"

export type SortKey = "name" | "price" | "appid" | "owners" | "discount" | "lastModified"

export function useGamesFilter(games?: GameDetails[], userMappings?: UserMapping[]) {
  const [search, setSearch] = usePersistentState("gamesPage_q", "")
  const [selectedTags, setSelectedTags] = usePersistentState<Set<string>>("gamesPage_tags", new Set())
  const [sortBy, setSortBy] = usePersistentState<SortKey>("gamesPage_sortBy", "owners")
  const [sortDesc, setSortDesc] = usePersistentState("gamesPage_sortDesc", true)
  const [hideNoPrice, setHideNoPrice] = usePersistentState("gamesPage_hideNoPrice", true)
  const [multiOwner, setMultiOwner] = usePersistentState("gamesPage_multiOwner", false)
  const [onlyOnSale, setOnlyOnSale] = usePersistentState("gamesPage_onlyOnSale", false)
  const [selectedOwners, setSelectedOwners] = usePersistentState<Set<string>>("gamesPage_owners", new Set())
  const [selectedCategories, setSelectedCategories] = usePersistentState<Set<string>>("gamesPage_cats", new Set())

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDesc(!sortDesc)
    } else {
      setSortBy(key)
      setSortDesc(true)
    }
  }

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
      if (sortBy === "name") {
        cmp = (a.name ?? "").localeCompare(b.name ?? "")
      } else if (sortBy === "price") {
        const aIsNA = a.priceOverview?.finalFormatted == null && !a.isFree
        const bIsNA = b.priceOverview?.finalFormatted == null && !b.isFree
        const aIsFree = a.isFree
        const bIsFree = b.isFree

        if (aIsNA && !bIsNA) cmp = -1
        else if (!aIsNA && bIsNA) cmp = 1
        else if (aIsFree && !bIsFree && !bIsNA) cmp = -1
        else if (!aIsFree && !aIsNA && bIsFree) cmp = 1
        else cmp = (a.priceOverview?.final ?? 0) - (b.priceOverview?.final ?? 0)
      } else if (sortBy === "appid") {
        cmp = a.appid - b.appid
      } else if (sortBy === "owners") {
        cmp = (a.ownedBy?.steamId?.length ?? 0) - (b.ownedBy?.steamId?.length ?? 0)
      } else if (sortBy === "discount") {
        cmp = (a.priceOverview?.discountPercent ?? 0) - (b.priceOverview?.discountPercent ?? 0)
        if (cmp === 0) {
          cmp = (a.priceOverview?.final ?? 0) - (b.priceOverview?.final ?? 0)
        }
      } else if (sortBy === "lastModified") {
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

  return {
    search, setSearch,
    selectedTags, setSelectedTags,
    sortBy, setSortBy,
    sortDesc, setSortDesc, handleSort,
    hideNoPrice, setHideNoPrice,
    multiOwner, setMultiOwner,
    onlyOnSale, setOnlyOnSale,
    selectedOwners, setSelectedOwners,
    selectedCategories, setSelectedCategories,
    allTags, allOwners, allCategories,
    filteredGames
  }
}
