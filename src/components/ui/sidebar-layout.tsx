import { useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

export interface SidebarSection {
  icon: ReactNode
  label: string
}

interface SidebarLayoutProps {
  icon: ReactNode
  iconContainerClass?: string
  title: string
  subtitle: ReactNode

  controlsPanel: ReactNode
  mainContent: ReactNode

  collapsedSections: SidebarSection[]

  mobileIcon: ReactNode
  mobileIconContainerClass?: string
  mobileTitle: string
  mobileSubtitle: ReactNode

  storageKey: string
  defaultOpen?: boolean
}

export default function SidebarLayout({
  icon,
  iconContainerClass = 'bg-accent/10',
  title,
  subtitle,
  controlsPanel,
  mainContent,
  collapsedSections,
  mobileIcon,
  mobileIconContainerClass = 'bg-accent/10',
  mobileTitle,
  mobileSubtitle,
  storageKey,
  defaultOpen = true,
}: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_sidebarOpen`)
    return saved !== null ? saved === 'true' : defaultOpen
  })
  useEffect(() => {
    localStorage.setItem(`${storageKey}_sidebarOpen`, String(sidebarOpen))
  }, [sidebarOpen, storageKey])

  return (
    <div className="py-12 px-6 flex gap-6 items-start">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 288 : 56 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="hidden lg:block glass-panel rounded-2xl overflow-hidden shrink-0 sticky top-12 self-start"
      >
        <motion.div layout transition={{ duration: 0.3 }}>
          <div className="flex items-center justify-between p-3">
            {sidebarOpen && (
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Menu</span>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-white"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence mode="popLayout">
          {sidebarOpen ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="p-4 pt-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg shrink-0 ${iconContainerClass}`}>
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-black tracking-tight truncate">{title}</h2>
                    <p className="text-xs text-muted-foreground font-mono truncate">{subtitle}</p>
                  </div>
                </div>

                {controlsPanel}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex flex-col items-center gap-4 py-4 px-1">
                {collapsedSections.map((section) => (
                  <div key={section.label} title={section.label}>{section.icon}</div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>
      </motion.aside>

      {/* Main content area */}
      <div className="flex-1 min-w-0 space-y-10">
        {/* Mobile header */}
        <div className="flex lg:hidden items-center gap-3 min-w-0">
          <div className={`p-2 rounded-lg shrink-0 ${mobileIconContainerClass}`}>
            {mobileIcon}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight truncate">{mobileTitle}</h1>
            <p className="text-xs text-muted-foreground font-mono truncate">{mobileSubtitle}</p>
          </div>
        </div>

        {mainContent}

        {/* Mobile floating filter button */}
        <div className="lg:hidden fixed bottom-8 left-8 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-3 rounded-2xl border border-accent/30 bg-background/80 backdrop-blur-md text-accent shadow-lg transition-all duration-300 hover:border-accent hover:shadow-[0_0_20px_hsl(var(--accent)/0.3)]">
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-[#141414] border-white/10 max-h-[80vh]">
              <SheetHeader>
                <SheetTitle className="text-white font-mono text-sm">Filters & Sort</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto py-4">
                {controlsPanel}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
