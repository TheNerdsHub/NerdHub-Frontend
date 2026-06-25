import { type ReactNode } from 'react'
import NavigationBar from './navigation-bar'
import Footer from './footer'
import { Toaster } from '@/components/ui/toaster'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavigationBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster />
    </div>
  )
}
