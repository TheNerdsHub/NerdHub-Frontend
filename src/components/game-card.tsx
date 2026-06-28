import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { GameDetails } from '@/lib/game-service'
import { getProxyImageUrl } from '@/lib/get-proxy-image'

export default function GameCard({ game, ownerMap }: { game: GameDetails; ownerMap?: Record<string, string> }) {
  const p = game.priceOverview
  const owners = game.ownedBy?.steamId ?? []
  const [showOwners, setShowOwners] = useState(false)
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }

  const showPopup = () => {
    clearHideTimer()
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPopupPos({ top: rect.top, left: rect.left + rect.width / 2 })
    }
    setShowOwners(true)
  }

  const hidePopup = () => {
    clearHideTimer()
    hideTimerRef.current = setTimeout(() => {
      setShowOwners(false)
      setPopupPos(null)
    }, 150)
  }

  return (
    <Link to={`/games/${game.appid}`} className="group block h-full">
      <div className="glass-panel h-full rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] relative">
        <div className="aspect-[460/215] w-full bg-black overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent z-10"></div>
          {game.isFree && (
            <div className="absolute top-0 right-0 z-20">
              <div className="relative">
                <div className="bg-green-500 text-black text-[9px] font-bold font-mono px-6 py-0.5 rotate-45 translate-x-[18%] translate-y-[60%]">
                  FREE
                </div>
              </div>
            </div>
          )}
          {game.headerImage ? (
            <img 
              src={getProxyImageUrl(game.headerImage)} 
              alt={game.name} 
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-[10px] font-mono">No Signal</div>
          )}
        </div>
        
        <div className="p-4 flex-1 flex flex-col relative z-20 -mt-6">
          <h3 className="font-bold text-base leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-1" title={game.name}>
            {game.name}
          </h3>
          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4 flex-1">
            {game.shortDescription || 'No data.'}
          </p>
          <div className="mt-auto flex items-end justify-between border-t border-white/5 pt-3">
            <div
              ref={triggerRef}
              className="relative"
              onMouseEnter={showPopup}
              onMouseLeave={hidePopup}
            >
              <span className="text-[9px] font-mono text-muted-foreground cursor-help">
                {owners.length} Owner{owners.length !== 1 ? 's' : ''}
              </span>
              {showOwners && owners.length > 0 && popupPos && createPortal(
                <div
                  onMouseEnter={clearHideTimer}
                  onMouseLeave={hidePopup}
                  style={{ position: 'fixed', top: popupPos.top - 8, left: popupPos.left, transform: 'translate(-50%, -100%)' }}
                  className="z-50 min-w-[200px] bg-[#141414] border border-primary/30 rounded-xl p-3 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                >
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 max-h-[240px] overflow-y-auto">
                    {owners
                      .sort((a, b) => {
                        const nameA = ownerMap?.[a] || a
                        const nameB = ownerMap?.[b] || b
                        return nameA.localeCompare(nameB)
                      })
                      .map((sid) => (
                        <div key={sid} className="text-[10px] font-mono text-muted-foreground px-1 py-0.5 rounded hover:bg-white/5 truncate">
                          {ownerMap?.[sid] || sid}
                        </div>
                      ))}
                  </div>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#141414]" />
                </div>,
                document.body
              )}
            </div>
            {game.isFree ? (
              <span className="text-[11px] font-mono font-bold text-green-400">Free</span>
            ) : !p?.finalFormatted ? (
              <span className="text-[9px] font-mono text-muted-foreground">N/A</span>
            ) : p.discountPercent > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded-sm">
                  -{p.discountPercent}%
                </span>
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-[9px] font-mono text-muted-foreground line-through">{p.initialFormatted}</span>
                  <span className="text-[11px] font-bold font-mono text-white">{p.finalFormatted}</span>
                </div>
              </div>
            ) : (
              <span className="text-[11px] font-mono font-bold text-white">{p.finalFormatted}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
