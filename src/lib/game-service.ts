import { api } from './api'

export interface GameDetails {
  appid: number
  name: string
  shortDescription?: string
  headerImage?: string
  capsuleImage?: string
  priceOverview?: {
    currency: string
    initial: number
    final: number
    discountPercent: number
    initialFormatted?: string
    finalFormatted?: string
  }
  isFree?: boolean
  platforms?: { windows: boolean; mac: boolean; linux: boolean }
  genres?: { description: string }[]
  developers?: string[]
  publishers?: string[]
  metacritic?: { score: number }
  releaseDate?: { date: string; comingSoon: boolean }
  categories?: { description: string }[]
  detailedDescription?: string
  aboutTheGame?: string
  controllerSupport?: string
  pcRequirements?: { minimum?: string; recommended?: string }
  macRequirements?: { minimum?: string; recommended?: string }
  linuxRequirements?: { minimum?: string; recommended?: string }
  ownedBy?: { steamId: string[] }
  playtimeByUser?: Record<string, {
    playtime_forever: number
    rtime_last_played: number
    playtime_windows_forever?: number
    playtime_mac_forever?: number
    playtime_linux_forever?: number
    playtime_deck_forever?: number
    playtime_disconnected?: number
  }>
  totalPlaytimeFormatted?: string
  lastPlayedDateFormatted?: string
  lastModifiedTime?: string
}

export interface UserMapping {
  steamId: string
  username: string
  nickname?: string
  discordId?: string
}

export const gameService = {
  getAllGames: () => api.get<GameDetails[]>('/api/Games'),

  getGameById: (appid: number) => api.get<GameDetails>(`/api/Games/${appid}`),

  getGamePlaytime: (appid: number) =>
    api.get<{
      appId: number
      name: string
      total_playtime_minutes: number
      total_playtime_formatted: string
      last_played_date_formatted?: string
      playtime_by_user?: Record<string, { playtime_forever: number; rtime_last_played: number }>
    }>(`/api/Games/${appid}/playtime`),

  updateGameInfo: (appid: number) =>
    api.post<{ message: string }>(`/api/Games/update-game-info/${appid}`),

  fetchUsernames: (steamIds: string[]) =>
    api.post<Record<string, { username: string; nickname?: string }>>('/api/Games/get-usernames', steamIds),

  getUserMappings: () => api.get<UserMapping[]>('/api/Games/get-all-usernames'),

  addOrUpdateUserMapping: (mapping: UserMapping) =>
    api.post<{ message: string }>('/api/Games/add-or-update-user-mapping', mapping),

  startUpdate: (steamIds: string, overrideExisting = false, appIdsToUpdate?: number[]) => {
    const params = new URLSearchParams({ overrideExisting: String(overrideExisting) })
    if (appIdsToUpdate) appIdsToUpdate.forEach((id) => params.append('appIdsToUpdate', String(id)))
    return api.post<{ operationId: string }>(`/api/Games/start-update?${params}`, steamIds)
  },

  startPriceUpdate: (batchSize = 400) => api.post<{ operationId: string }>(`/api/Games/start-price-update?batchSize=${batchSize}`),

  startGameInfoUpdate: () => api.post<{ operationId: string }>('/api/Games/start-game-info-update'),

  getProgress: (operationId: string) =>
    api.get<{
      progress: number
      phase: string
      message: string
      retryAfterSeconds?: number
    }>(`/api/Games/update-progress/${operationId}`),

  getUpdateResult: (operationId: string) =>
    api.get<Record<string, unknown>>(`/api/Games/update-result/${operationId}`),
}
