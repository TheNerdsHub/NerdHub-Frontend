import { type ReactNode } from 'react'
import Sidebar from './sidebar'
import BackToTop from '@/components/back-to-top'
import { Toaster } from '@/components/ui/toaster'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:pl-20 pt-14 lg:pt-0 w-full">
        {children}
      </main>
      <BackToTop />
      <Toaster />
    </div>
  )
}