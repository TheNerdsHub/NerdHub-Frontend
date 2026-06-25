import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const navItems = [
  { label: 'Games', href: '/games', auth: false },
  { label: 'Timeline', href: '/timeline', auth: true },
  { label: 'Quotes', href: '/quotes', auth: true },
  { label: 'About', href: '/about', auth: false },
]

const nerdsTools = [
  { label: 'TheNerds Calendar', href: 'URLTOCALENDAR' },
  { label: 'File Sharing', href: 'URLTOFILESHARE' },
  { label: 'Knowledge Base', href: 'URLTOKB' },
  { label: 'Bracket Maker', href: 'URLTOBRACKETMAKER' },
]

export default function NavigationBar() {
  const { isAuthenticated, user, login, logout } = useAuth()
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-sm">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">NerdHub</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                {navItems
                  .filter((item) => !item.auth || isAuthenticated)
                  .map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'block px-2 py-1 text-lg font-medium transition-colors hover:text-primary',
                        pathname === item.href ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                {isAuthenticated && (
                  <div className="pt-4">
                    <h4 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                      Nerds Tools
                    </h4>
                    {nerdsTools.map((tool) => (
                      <a
                        key={tool.label}
                        href={tool.href}
                        target="_blank"
                        rel="noreferrer"
                        className="block px-2 py-1 text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                      >
                        {tool.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="text-lg font-bold tracking-tight">
            NerdHub
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            {navItems
              .filter((item) => !item.auth || isAuthenticated)
              .map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-white/80',
                    pathname === item.href ? 'text-white' : 'text-white/70',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            {isAuthenticated && (
              <div className="group relative">
                <button className="text-sm font-medium text-white/70 hover:text-white/80">
                  Nerds Tools
                </button>
                <div className="invisible absolute left-0 top-full z-50 mt-1 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                  {nerdsTools.map((tool) => (
                    <a
                      key={tool.label}
                      href={tool.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      {tool.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="group relative">
              <button className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium hover:bg-white/10">
                <img
                  src={user?.avatar || 'https://www.gravatar.com/avatar/?d=identicon'}
                  alt=""
                  className="h-7 w-7 rounded-full"
                />
                <span className="hidden sm:inline">{user?.username || 'User'}</span>
              </button>
              <div className="invisible absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <Link
                  to="/profile"
                  className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Profile
                </Link>
                <Link
                  to="/admin"
                  className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Admin
                </Link>
                <div className="my-1 h-px bg-border" />
                <button
                  onClick={logout}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={login}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
