import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
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
      </Layout>
    </AuthProvider>
  )
}
