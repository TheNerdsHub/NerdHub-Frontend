import { TableCell, TableRow } from "@/components/ui/table"
import { Hash, Trash2 } from "lucide-react"
import { formatDateTime } from "@/lib/date-utils"
import { formatQuoteText } from "@/lib/quote-utils"
import type { Quote } from "@/lib/quote-service"

interface QuoteRowProps {
  quote: Quote
  onDelete: (id: string) => void
}

export function QuoteRow({ quote, onDelete }: QuoteRowProps) {
  return (
    <TableRow className="border-white/5 hover:bg-white/5 transition-colors">
      <TableCell className="font-medium text-white/90 italic py-4">
        {formatQuoteText(quote.quoteText)}
      </TableCell>
      <TableCell className="text-accent font-medium py-4">
        {quote.quotedPersons.join(", ")}
      </TableCell>
      <TableCell className="py-4">
        {quote.channelName && (
          <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded-md">
            <Hash className="w-3 h-3" />{quote.channelName}
          </span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground font-mono text-xs py-4">
        {quote.submitter}
      </TableCell>
      <TableCell className="text-right font-mono text-xs text-muted-foreground py-4">
        {formatDateTime(quote.timestamp)}
      </TableCell>
      <TableCell className="py-4">
        <button
          onClick={() => quote.id && onDelete(quote.id)}
          className="text-muted-foreground hover:text-destructive transition-colors"
          title="Delete quote"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </TableCell>
    </TableRow>
  )
}
