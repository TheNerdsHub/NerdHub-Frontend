import React, { useEffect, useState } from 'react';
import 'styles/ScrollToTop.css'; // Create a new CSS file for styling

function ScrollToTop() {
  const [showTopButton, setShowTopButton] = useState(false);
  const [nearBottom, setNearBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const newScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      setShowTopButton(newScrollY > 300);
      setNearBottom((newScrollY + windowHeight) >= (fullHeight - 150));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`scroll-to-top ${showTopButton ? 'visible' : ''}`}
      onClick={scrollToTop}
      style={{ bottom: nearBottom ? '100px' : '40px' }}
    >
      <span className="scroll-arrow">⬆</span>
    </button>
  );
}

export default ScrollToTop;