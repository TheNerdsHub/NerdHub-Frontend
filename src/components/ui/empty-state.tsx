import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  message?: string
  className?: string
}

export function EmptyState({
  icon: Icon,
  message = 'No matching records found.',
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`py-24 text-center text-muted-foreground glass-panel rounded-3xl border-dashed flex flex-col items-center gap-4 ${className}`}>
      {Icon && <Icon className="w-12 h-12 text-muted-foreground/30" />}
      <p className="font-mono">{message}</p>
    </div>
  )
}
