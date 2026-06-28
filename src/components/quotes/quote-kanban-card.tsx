import { User, Hash, Calendar, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/date-utils"
import { formatQuoteText } from "@/lib/quote-utils"
import type { Quote } from "@/lib/quote-service"

interface QuoteKanbanCardProps {
  quote: Quote
  onDelete: (id: string) => void
}

export function QuoteKanbanCard({ quote, onDelete }: QuoteKanbanCardProps) {
  return (
    <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3 hover:border-primary/30 transition-colors">
      <div className="text-sm font-serif italic text-white/90 leading-relaxed">
        {formatQuoteText(quote.quoteText)}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <User className="w-3 h-3 text-accent" />
          {quote.quotedPersons.join(", ")}
        </span>
        {quote.channelName && (
          <span className="inline-flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {quote.channelName}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(quote.timestamp)}
        </span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-white/5">
        <span className="text-[10px] text-muted-foreground font-mono">Logged by {quote.submitter}</span>
        <button
          onClick={() => quote.id && onDelete(quote.id)}
          className="text-muted-foreground hover:text-destructive transition-colors"
          title="Delete quote"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
