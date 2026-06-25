import { type ReactNode } from 'react'
import Sidebar from './sidebar'
import { Toaster } from '@/components/ui/toaster'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:pl-20 pt-14 md:pt-0 w-full overflow-hidden">
        {children}
      </main>
      <Toaster />
    </div>
  )
}