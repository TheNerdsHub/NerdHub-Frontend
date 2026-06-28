import { useMemo } from 'react'
import type { UserMapping } from '@/lib/game-service'

export function useOwnerMap(userMappings?: UserMapping[]) {
  return useMemo(() => {
    if (!userMappings) return undefined
    const map: Record<string, string> = {}
    for (const u of userMappings) {
      map[u.steamId] = u.nickname || u.username
    }
    return map
  }, [userMappings])
}
