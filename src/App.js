import React from 'react';
import NavigationBar from 'components/layout/NavigationBar';
import Footer from 'components/layout/Footer';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from 'components/pages/HomePage';
import GamesPage from 'components/pages/GamesPage';
import GameDetailsPage from 'components/pages/GameDetailsPage';
import QuotePage from 'components/pages/QuotesPage';
import TimelinePage from 'components/pages/TimelinePage';
import Profile from 'components/pages/ProfilePage';
import AdminPage from 'components/pages/AdminPage';
import AboutPage from 'components/pages/AboutPage';
import NotFoundPage from 'components/pages/NotFoundPage';
import ScrollToTop from 'components/common/ScrollToTop';
import { AuthProvider, useAuth } from 'contexts/AuthContext';

// Main App Routes Component
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/games" element={<GamesPage />} />
      <Route path="/games/:appid" element={<GameDetailsPage />} />
      <Route path="/quotes" element={<QuotePage />} />
      <Route
        path="/timeline"
        element={
          isAuthenticated ? (
            <TimelinePage />
          ) : (
            <div>Please sign in to view the timeline page.</div>
          )
        }
      />
      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <Profile />
          ) : (
            <div>Please sign in to view your profile.</div>
          )
        }
      />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="page-container">
          <NavigationBar />
          <main className="content-wrap">
            <AppRoutes />
          </main>
          <ScrollToTop />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
