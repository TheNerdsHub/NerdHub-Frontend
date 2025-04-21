import React from 'react';
import useDocumentTitle from '../useDocumentTitle';
import './HomePage.css';

function HomePage() {
  useDocumentTitle('Home');
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to NerdHub</h1>
          <p>Your ultimate hub for games, quotes, and timelines.</p>
          <a href="/games" className="cta-button">Explore Games</a>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature">
          <h2>Games</h2>
          <p>Discover and explore a wide variety of games with detailed information.</p>
        </div>
        <div className="feature">
          <h2>Quotes</h2>
          <p>Get inspired by a collection of memorable quotes from your favorite sources.</p>
        </div>
        <div className="feature">
          <h2>Timeline</h2>
          <p>Relive the journey of your community with a detailed timeline.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} NerdHub. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;