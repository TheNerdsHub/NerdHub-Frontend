import React, { useEffect, useState, useRef } from 'react';
import NavigationBar from 'components/NavigationBar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from 'components/pages/HomePage';
import GamesPage from 'components/pages/GamesPage';
import GameDetailsPage from 'components/pages/GameDetailsPage';
import QuotePage from 'components/pages/QuotesPage';
import TimelinePage from 'components/pages/TimelinePage';
import Profile from 'components/pages/ProfilePage';
import keycloak from 'keycloak';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const keycloakInitialized = useRef(false); // Track initialization

  useEffect(() => {
    if (!keycloakInitialized.current) {
      keycloak
        .init()
        .then(authenticated => {
          setIsAuthenticated(authenticated);
          if (authenticated) {
            console.log('User is authenticated');
          } else {
            console.log('User is not authenticated');
          }
        })
        .catch(error => {
          console.error('Failed to initialize Keycloak:', error);
        });

      keycloakInitialized.current = true; // Mark as initialized
    }
  }, []);

  return (
    <Router>
      <NavigationBar keycloak={keycloak} />
      <Routes>
        <Route path="/" element={<HomePage />} />
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
      </Routes>
    </Router>
  );
}

export default App;