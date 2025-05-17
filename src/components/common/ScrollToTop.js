import React, { useState, useEffect, useRef } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import 'styles/ScrollToTop.css';

function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [avoidFooter, setAvoidFooter] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 75);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  useEffect(() => {
    const footer = document.querySelector('footer');
    const button = buttonRef.current;

    if (!footer || !button) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setAvoidFooter(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
      }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      ref={buttonRef}
      className={`scroll-to-top ${visible ? 'show' : ''} ${avoidFooter ? 'avoid-footer' : ''}`}
      onClick={scrollToTop}
    >
      <FaArrowUp />
    </div>
  );
}

export default ScrollToTop;
