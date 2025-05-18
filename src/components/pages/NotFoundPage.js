import React, { useEffect, useState } from 'react';
import 'styles/NotFoundPage.css';
import TheNerdsNoBG from 'assets/TheNerdsNoBG.png';

function NotFoundPage() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Delay the animation trigger by 2 seconds
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="centered-container">
  <div className={`logo-slice-container ${animate ? 'animate' : ''}`}>
    <div className="logo-slice top-slice">
      <img src={TheNerdsNoBG} alt="The Nerds Logo Top Slice" />
    </div>
    <div className="logo-slice bottom-slice">
      <img src={TheNerdsNoBG} alt="The Nerds Logo Bottom Slice" />
    </div>

    {/* Knife Slice Animation */}
    <div className={`knife-slash ${animate ? 'show' : ''}`} />
  </div>

  <h1>404 - Page Not Found</h1>
  <p>The page you are looking for does not exist.</p>
  <a href="/" className="cta-button">Go Home</a>
</div>
  );
}

export default NotFoundPage;
