import { Link } from "react-router-dom"
import { Copy, Search, Edit } from "lucide-react"
import { copyToClipboard } from "@/lib/clipboard"
import type { UserMapping } from "@/lib/game-service"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface GameContextMenuProps {
  children: React.ReactNode
  steamId: string
  userMapping?: UserMapping
  onClose?: () => void
  onEdit?: () => void
}

export function GameContextMenu({ children, steamId, userMapping, onClose, onEdit }: GameContextMenuProps) {
  return (
    <DropdownMenu onOpenChange={(open) => !open && onClose?.()}>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[180px] bg-popover/95 backdrop-blur-xl border-white/10"
      >
        {onEdit && (
          <>
            <DropdownMenuItem
              onClick={onEdit}
              className="text-xs font-mono text-primary focus:bg-primary/20 focus:text-primary cursor-pointer"
            >
              <Edit className="mr-2 w-3 h-3" />
              Edit Mapping
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
          </>
        )}
        <DropdownMenuItem
          onClick={() => copyToClipboard(steamId)}
          className="text-xs font-mono text-muted-foreground focus:bg-accent/20 focus:text-white cursor-pointer"
        >
          <Copy className="mr-2 w-3 h-3" />
          Copy Steam ID
        </DropdownMenuItem>
        
        {userMapping?.discordId && (
          <DropdownMenuItem
            onClick={() => copyToClipboard(userMapping.discordId!)}
            className="text-xs font-mono text-muted-foreground focus:bg-accent/20 focus:text-white cursor-pointer"
          >
            <Copy className="mr-2 w-3 h-3" />
            Copy Discord ID
          </DropdownMenuItem>
        )}
        
        {userMapping?.username && (
          <DropdownMenuItem
            onClick={() => copyToClipboard(userMapping.username)}
            className="text-xs font-mono text-muted-foreground focus:bg-accent/20 focus:text-white cursor-pointer"
          >
            <Copy className="mr-2 w-3 h-3" />
            Copy Username
          </DropdownMenuItem>
        )}

        {(userMapping?.nickname || userMapping?.username) && (
          <DropdownMenuItem
            onClick={() => copyToClipboard(userMapping.nickname || userMapping.username)}
            className="text-xs font-mono text-muted-foreground focus:bg-accent/20 focus:text-white cursor-pointer"
          >
            <Copy className="mr-2 w-3 h-3" />
            Copy Nickname
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild className="text-xs font-mono text-muted-foreground focus:bg-accent/20 focus:text-white cursor-pointer">
          <Link to={`/games?owner=${steamId}`}>
            <Search className="mr-2 w-3 h-3" />
            Open Games Search
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
