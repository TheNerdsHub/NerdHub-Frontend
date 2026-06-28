import { Calendar, X } from 'lucide-react'

interface DateRangePickerProps {
  dateFrom: string
  dateTo: string
  onFromChange: (val: string) => void
  onToChange: (val: string) => void
  onClear: () => void
  minDate?: string
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onFromChange,
  onToChange,
  onClear,
  minDate = '2020-01-01',
}: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 w-full">
      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <input
        type="date"
        min={minDate}
        value={dateFrom}
        onChange={(e) => onFromChange(e.target.value)}
        className="bg-black/80 text-xs font-mono text-muted-foreground focus:text-white focus:outline-none cursor-pointer rounded-md px-2 py-0.5 border border-white/10 flex-1 min-w-0 [color-scheme:dark]"
      />
      <span className="text-muted-foreground text-xs shrink-0">-</span>
      <input
        type="date"
        min={minDate}
        value={dateTo}
        onChange={(e) => onToChange(e.target.value)}
        className="bg-black/80 text-xs font-mono text-muted-foreground focus:text-white focus:outline-none cursor-pointer rounded-md px-2 py-0.5 border border-white/10 flex-1 min-w-0 [color-scheme:dark]"
      />
      {(dateFrom || dateTo) && (
        <button
          onClick={onClear}
          className="text-muted-foreground hover:text-white transition-colors shrink-0"
          title="Clear dates"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
