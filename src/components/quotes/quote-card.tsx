import { Quote as QuoteIcon, Calendar, User, Hash, Trash2 } from "lucide-react"
import { formatDateTime } from "@/lib/date-utils"
import { formatQuoteText } from "@/lib/quote-utils"
import type { Quote } from "@/lib/quote-service"

interface QuoteCardProps {
  quote: Quote
  onDelete: (id: string) => void
}

export function QuoteCard({ quote, onDelete }: QuoteCardProps) {
  return (
    <div className="glass-panel rounded-3xl p-8 flex flex-col group relative overflow-hidden transition-all duration-300 hover:border-primary/30">
      <QuoteIcon className="absolute -top-4 -right-4 w-32 h-32 text-white/[0.02] group-hover:text-primary/[0.05] transition-colors duration-500 pointer-events-none" />

      <div className="mb-6">
        <QuoteIcon className="h-6 w-6 text-primary/40 mb-4 group-hover:text-primary transition-colors" />
        <p className="text-xl font-serif italic text-white/90 leading-relaxed">
          {formatQuoteText(quote.quoteText)}
        </p>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-accent" />
          <span className="font-bold text-accent text-sm tracking-wide">
            {quote.quotedPersons.join(", ")}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
          <span>Logged By: {quote.submitter}</span>
          {quote.channelName && (
            <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
              <Hash className="h-3 w-3" />
              {quote.channelName}
            </span>
          )}
          <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
            <Calendar className="h-3 w-3" />
            {formatDateTime(quote.timestamp)}
          </span>
          <button
            onClick={() => quote.id && onDelete(quote.id)}
            className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
            title="Delete quote"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
