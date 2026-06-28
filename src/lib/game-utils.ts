import type { GameDetails } from './game-service'

export function formatPlaytime(minutes?: number) {
  if (!minutes || minutes === 0) return '0m'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function calculateTotalPlaytime(game?: GameDetails) {
  if (!game?.playtimeByUser) return 0
  return Object.values(game.playtimeByUser).reduce((sum, u) => sum + (u.playtime_forever || 0), 0)
}

export function getLastPlayedDate(game?: GameDetails) {
  if (!game?.playtimeByUser) return null
  const times = Object.values(game.playtimeByUser)
    .map(u => u.rtime_last_played)
    .filter(t => t > 0)
  if (times.length === 0) return null
  return new Date(Math.max(...times) * 1000)
}
