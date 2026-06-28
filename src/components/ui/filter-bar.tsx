import * as React from "react"
import { cn } from "@/lib/utils"

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function FilterBar({ className, ...props }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 flex-wrap bg-black/40 border border-white/10 rounded-xl px-2 py-1.5",
        className
      )}
      {...props}
    />
  )
}

export interface FilterBarPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export const FilterBarPill = React.forwardRef<HTMLButtonElement, FilterBarPillProps>(
  ({ className, active = false, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-lg transition-colors",
        active
          ? "bg-accent/20 text-accent"
          : "text-muted-foreground hover:text-white",
        className
      )}
      {...props}
    />
  )
)
FilterBarPill.displayName = "FilterBarPill"

FilterBar.Pill = FilterBarPill
