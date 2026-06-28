import type { LucideIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { X } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

interface FilterDropdownProps {
  icon: LucideIcon
  label: string
  selected: Set<string>
  onSelectionChange: (next: Set<string>) => void
  options: FilterOption[]
}

export function FilterDropdown({ icon: Icon, label, selected, onSelectionChange, options }: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 transition-colors w-full">
          <Icon className="w-3.5 h-3.5" />
          {selected.size > 0 ? `${selected.size} selected` : label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 bg-[#141414] border-white/10 font-mono text-xs">
        {selected.size > 0 && (
          <>
            <button
              onClick={() => onSelectionChange(new Set())}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
            <DropdownMenuSeparator className="bg-white/10" />
          </>
        )}
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.value}
            checked={selected.has(opt.value)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() => {
              const next = new Set(selected)
              if (next.has(opt.value)) next.delete(opt.value)
              else next.add(opt.value)
              onSelectionChange(next)
            }}
            className="text-muted-foreground data-[state=checked]:text-primary focus:text-white"
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
