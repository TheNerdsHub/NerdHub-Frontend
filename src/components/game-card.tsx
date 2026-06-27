import { Link } from 'react-router-dom'
import type { GameDetails } from '@/lib/game-service'

export default function GameCard({ game }: { game: GameDetails }) {
  const p = game.priceOverview

  return (
    <Link to={`/games/${game.appid}`} className="group block h-full">
      <div className="glass-panel h-full rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] relative">
        <div className="aspect-[460/215] w-full bg-black overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent z-10"></div>
          {game.headerImage ? (
            <img 
              src={game.headerImage} 
              alt={game.name} 
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-[10px] font-mono uppercase tracking-widest">No Signal</div>
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
            <span className="text-[9px] font-mono text-muted-foreground self-center">ID:{game.appid}</span>
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
