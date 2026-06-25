import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth-context'
import Layout from '@/components/layout/layout'
import HomePage from '@/pages/home-page'
import AboutPage from '@/pages/about-page'
import GamesPage from '@/pages/games-page'
import GameDetailsPage from '@/pages/game-details-page'
import QuotesPage from '@/pages/quotes-page'
import TimelinePage from '@/pages/timeline-page'
import ProfilePage from '@/pages/profile-page'
import AdminPage from '@/pages/admin-page'
import NotFoundPage from '@/pages/not-found-page'
import { AnimatePresence, motion } from 'motion/react'

export default function App() {
  const location = useLocation()

  return (
    <AuthProvider>
      <Layout>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/games/:appid" element={<GameDetailsPage />} />
              <Route path="/quotes" element={<QuotesPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Layout>
    </AuthProvider>
  )
}