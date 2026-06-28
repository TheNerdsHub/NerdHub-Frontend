import React, { type ReactNode } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  width?: string
  render: (item: T) => ReactNode
}

interface SortableTableProps<T> {
  columns: Column<T>[]
  data: T[]
  sortColumn: string
  sortDesc: boolean
  onSort: (key: string) => void
  keyExtractor: (item: T) => string
  isLoading?: boolean
  loadingRows?: number
  emptyMessage?: string
  onRowClick?: (item: T) => void
  onContextMenu?: (item: T, e: React.MouseEvent) => void
  rowWrapper?: (item: T, children: React.ReactNode) => React.ReactNode
  rowClassName?: string
}

export function SortableTable<T>({
  columns,
  data,
  sortColumn,
  sortDesc,
  onSort,
  keyExtractor,
  isLoading = false,
  loadingRows = 5,
  emptyMessage = 'No data found.',
  onRowClick,
  onContextMenu,
  rowWrapper,
  rowClassName = 'border-b border-white/5 hover:bg-white/5 transition-colors',
}: SortableTableProps<T>) {
  return (
    <div className="flex-1 rounded-2xl border border-white/10 overflow-hidden bg-black/20 relative">
      <div className="absolute inset-0 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[#0a0a0a] z-10 shadow-sm border-b border-white/10">
            <tr className="border-none hover:bg-transparent">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`font-mono text-xs text-muted-foreground px-4 py-3 ${col.sortable ? 'cursor-pointer select-none' : ''} ${col.width ? col.width : ''}`}
                  onClick={() => col.sortable && onSort(col.key)}
                >
                  {col.header}
                  {col.sortable && sortColumn === col.key && (
                    sortDesc ? <ArrowDown className="w-3 h-3 inline ml-1" /> : <ArrowUp className="w-3 h-3 inline ml-1" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center font-mono text-sm text-muted-foreground py-12">
                  Loading...
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item) => {
                const tr = (
                  <tr
                    key={keyExtractor(item)}
                    className={rowClassName}
                    onClick={() => onRowClick?.(item)}
                    onContextMenu={(e) => onContextMenu?.(item, e)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render(item)}
                      </td>
                    ))}
                  </tr>
                )
                return rowWrapper ? <React.Fragment key={keyExtractor(item)}>{rowWrapper(item, tr)}</React.Fragment> : tr
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center font-mono text-sm text-muted-foreground py-12">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
