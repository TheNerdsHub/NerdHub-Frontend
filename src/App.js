import React, { useEffect, useState, useRef } from 'react';
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
import keycloak from 'keycloak';
import ScrollToTop from 'components/common/ScrollToTop';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const keycloakInitialized = useRef(false);

  useEffect(() => {
    if (!keycloakInitialized.current) {
      keycloak
        .init()
        .then(authenticated => {
          setIsAuthenticated(authenticated);
        })
        .catch(error => {
          console.error('Failed to initialize Keycloak:', error);
        });

      keycloakInitialized.current = true;
    }
  }, []);

  return (
    <Router>
      <div className="page-container">
        <NavigationBar keycloak={keycloak} isAuthenticated={isAuthenticated} />
        <main className="content-wrap">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/:appid" element={<GameDetailsPage />} />
            <Route
              path="/quotes"
              element={
                isAuthenticated ? (
                  <QuotePage />
                ) : (
                  <div>Please sign in to view the quotes page.</div>
                )
              }
            />
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
                  <Profile keycloak={keycloak} />
                ) : (
                  <div>Please sign in to view your profile.</div>
                )
              }
            />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <ScrollToTop />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
