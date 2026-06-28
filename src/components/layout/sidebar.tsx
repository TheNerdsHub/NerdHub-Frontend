import { Link, useLocation } from 'react-router-dom'
import { 
  Gamepad2, 
  History, 
  MessageSquareQuote, 
  Info, 
  LogOut,
  Moon,
  Sun,
  Menu,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'Games', href: '/games', icon: Gamepad2, auth: false },
  { label: 'Timeline', href: '/timeline', icon: History, auth: true },
  { label: 'Quotes', href: '/quotes', icon: MessageSquareQuote, auth: true },
  { label: 'About', href: '/about', icon: Info, auth: false },
  { label: 'Admin', href: '/admin', icon: ShieldCheck, auth: true },
]

export default function Sidebar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { pathname } = useLocation()
  const [isLight, setIsLight] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    // Check initial theme
    setIsLight(document.documentElement.classList.contains('light'))
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    if (isLight) {
      root.classList.remove('light')
    } else {
      root.classList.add('light')
    }
    setIsLight(!isLight)
  }

  const NavContent = () => (
    <>
      <div className="flex flex-col items-center py-6 gap-4 border-b border-white/5">
        <Link to="/" className="block">
          <img src="/TheNerdsLogo.png" alt="NerdHub" className="w-10 h-10 object-contain rounded-md" />
        </Link>
      </div>

      <nav className="flex-1 flex flex-col items-center py-6 gap-4 w-full">
        {navItems
          .filter((item) => !item.auth || isAuthenticated)
          .map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <div key={item.href} className="group relative">
                <Link
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300',
                    isActive 
                      ? 'bg-primary/10 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]' 
                      : 'text-muted-foreground hover:text-primary hover:bg-white/5'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </Link>
                {/* Tooltip */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs font-mono rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-border">
                  {item.label}
                </div>
              </div>
            )
          })}
      </nav>

      <div className="flex flex-col items-center py-6 gap-4 border-t border-white/5 w-full">
        {isAuthenticated ? (
          <>
            <div className="group relative">
              <Link to="/profile" onClick={() => setIsMobileOpen(false)} className="block">
                <img
                  src={user?.avatar || 'https://www.gravatar.com/avatar/?d=identicon'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-transparent hover:border-primary transition-colors"
                />
              </Link>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs font-mono rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-border">
                Profile
              </div>
            </div>
            
            <div className="group relative">
              <button 
                onClick={() => { logout(); setIsMobileOpen(false); }}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs font-mono rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-border">
                Sign Out
              </div>
            </div>
          </>
        ) : (
          <div className="group relative">
            <Link 
              to="/" // Auth integration pending
              className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center">
                ?
              </div>
            </Link>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs font-mono rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-border">
              Sign In
            </div>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mt-2"
        >
          {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-md border-b z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/TheNerdsLogo.png" alt="NerdHub" className="w-8 h-8 object-contain rounded-md" />
          <span className="text-lg font-black tracking-tighter text-primary">NerdHub</span>
        </Link>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 flex-col bg-[#0a0a0a] border-r border-white/5 z-40">
        <NavContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative w-20 h-full bg-[#0a0a0a] border-r border-white/5 flex flex-col pt-14">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}