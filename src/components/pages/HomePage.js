import React from 'react';
import useDocumentTitle from '../useDocumentTitle';
import './HomePage.css';
import GameIcon from '../assets/GamingIcon.png';
import QuotesIcon from '../assets/QuotesIcon.png';
import TimelineIcon from '../assets/TimelineIcon.png';
import Footer from '../Footer';

function HomePage() {
  useDocumentTitle('Home');
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="press-start-2p-regular text-shadow">Welcome to NerdHub</h1>
          <p className='text-shadow'>Your ultimate hub for games, quotes, and timelines, and so much more!</p>
          <a href="/games" className="cta-button">Explore Games</a>
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
      <Footer />
    </div>
  );
}

export default HomePage;