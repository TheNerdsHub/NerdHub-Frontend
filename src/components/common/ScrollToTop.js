import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa'; // Using react-icons for consistency
import 'styles/ScrollToTop.css'; // (separate css if needed)

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div
      className={`scroll-to-top ${visible ? 'show' : ''}`}
      onClick={scrollToTop}
    >
      <FaArrowUp />
    </div>
  );
}

export default ScrollToTop;
