import { Skeleton } from "@/components/ui/skeleton"

export function QuoteCardSkeleton() {
  return <Skeleton className="h-64 rounded-3xl border border-white/5" />
}

export function QuoteRowSkeleton() {
  return <Skeleton className="h-16 rounded-xl border border-white/5 mb-2 w-full" />
}

export function QuoteKanbanSkeleton() {
  return <Skeleton className="min-w-[320px] h-96 rounded-3xl border border-white/5" />
}
