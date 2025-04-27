import React, { useState, useEffect } from 'react';
import useDocumentTitle from 'components/useDocumentTitle';
import GameIcon from 'assets/GamingIcon.png';
import QuotesIcon from 'assets/QuotesIcon.png';
import TimelineIcon from 'assets/TimelineIcon.png';
import Footer from 'components/Footer';
import 'styles/HomePage.css';

function HomePage() {
  useDocumentTitle('Home');
  
  const [showTopButton, setShowTopButton] = useState(false);
  const [nearBottom, setNearBottom] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const newScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      setShowTopButton(newScrollY > 300);
      setScrollY(newScrollY);
      setNearBottom((newScrollY + windowHeight) >= (fullHeight - 150));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="homepage">
      <div className="content">
      {/* Hero Section */}
      <section
        className="hero"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          opacity: `${1 - scrollY / 500}`
        }}
      >
        <div className="hero-content">
          <h1 className="press-start-2p-regular text-shadow">Welcome to NerdHub</h1>
          <p className="text-shadow">Your ultimate hub for games, quotes, and timelines, and so much more!</p>
          <a href="/games" className="cta-button">Explore Games</a>

          <div
            className="scroll-down"
            style={{
              opacity: scrollY < 50 ? 0.8 : 0,
              pointerEvents: scrollY < 50 ? 'auto' : 'none'
            }}
          >
            ⬇
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature">
        <img src={GameIcon} alt="Games Icon" style={{ width: '150px', height: 'auto' }} />
          <h2>Games</h2>
          <p>Want to check out what games everyone owns? Click the image above to go to our one-stop-shop games Library Page.
            This section is perfect for Friday Night Game Night. Our Games page allows you to automatically show games that
            are owned by those of us who are currently in the voice chats, so no more time wasted trying to figure out who owns 
            what and who is willing to play what.
          </p>
        </div>
        <div className="feature">
        <img src={QuotesIcon} alt="Games Icon" style={{ width: '150px', height: 'auto' }} />
          <h2>Quotes</h2>
          <p>Check out the one-stop-shop for all our wild and wacky quotes. Our quotes page allows you to sort
            and filter quotes by the person who said them or submitted them. You can also search for your favorite one, and
            even view stats on the quotes like who has submitted the most!
          </p>
        </div>
        <div className="feature">
        <img src={TimelineIcon} alt="Games Icon" style={{ width: '150px', height: 'auto' }} />
          <h2>Timeline</h2>
          <p>Our friend group has been through plenty of changes, lovingly referred to as "TheNerds Eras."
            This timeline page allows you to view the history of our friend group, and see how we have changed over
            the years when it comes to who has joined, how each member was introduced to the others, and even those who left.
          </p>
        </div>
      </section>
      </div>
      {/* Footer */}
      <Footer />
      <button
        className={`scroll-to-top ${showTopButton ? 'visible' : ''}`}
        onClick={scrollToTop}
        style={{ bottom: nearBottom ? '100px' : '40px' }}
      >
        <span className="scroll-arrow">⬆</span>
      </button>
    </div>
  );
}

export default HomePage;