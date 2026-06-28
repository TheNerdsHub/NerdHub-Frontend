interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'section' | 'article'
}

export function GlassPanel({ children, className = '', as: Tag = 'div' }: GlassPanelProps) {
  return (
    <Tag className={`glass-panel rounded-3xl p-8 space-y-6 ${className}`}>
      {children}
    </Tag>
  )
}
