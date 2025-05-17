import React from 'react';
import 'styles/NotFoundPage.css';

function NotFoundPage() {
  return (
    <div className="centered-container">
      <div className="cute-ghost" aria-hidden="true">
        <div className="cute-ghost-body">
          <div className="cute-ghost-face">
            <div className="cute-ghost-eye"></div>
            <div className="cute-ghost-eye"></div>
            <div className="cute-ghost-mouth"></div>
          </div>
          <div className="cute-ghost-bottom">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/" className="cta-button">Go Home</a>
    </div>
  );
}

export default NotFoundPage;