import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from 'components/useDocumentTitle';
import Footer from 'components/Footer';
import 'styles/GamesPage.css';

const API_ROOT = process.env.REACT_APP_API_ROOT;

function GamesPage() {
  useDocumentTitle('Games');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('sortBy') || 'owners'); // Default to 'owners'
  const [sortDirection, setSortDirection] = useState(() => localStorage.getItem('sortDirection') || 'desc'); // Default to 'desc'
  const [excludeNA, setExcludeNA] = useState(() => JSON.parse(localStorage.getItem('excludeNA')) ?? true); // Default to true
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [showTopButton, setShowTopButton] = useState(false); // State for "scroll to top" button
  const [nearBottom, setNearBottom] = useState(false); // State for detecting proximity to the bottom

  useEffect(() => {
    // Fetch all games from the backend
    const fetchGames = async () => {
      try {
        const response = await fetch(`${API_ROOT}/api/games`);
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Save sortBy, sortDirection, and excludeNA to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sortBy', sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem('sortDirection', sortDirection);
  }, [sortDirection]);

  useEffect(() => {
    localStorage.setItem('excludeNA', excludeNA);
  }, [excludeNA]);

  // Handle scroll events for "scroll to top" button
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

  // Filter games based on the search query
  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort and filter games based on the selected criterion, direction, and excludeNA
  const sortedGames = [...filteredGames]
    .filter((game) => !excludeNA || !(game.priceOverview?.finalFormatted == null && !game.isFree)) // Filter out "N/A" results if excludeNA is true
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'appid') {
        comparison = a.appid - b.appid;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        const priceA = a.priceOverview?.final || 0;
        const priceB = b.priceOverview?.final || 0;
        comparison = priceA - priceB;
      } else if (sortBy === 'owners') {
        const ownersA = a.ownedBy?.steamId?.length || 0;
        const ownersB = b.ownedBy?.steamId?.length || 0;
        comparison = ownersA - ownersB;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="sort-container">
        <label htmlFor="search">Search:</label>
        <input
          type="text"
          id="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search games..."
        />
        <label htmlFor="sort-by">Sort By:</label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="appid">App ID</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="owners">Owners</option>
        </select>
        <button
          className="sort-direction-button"
          onClick={() =>
            setSortDirection((prevDirection) =>
              prevDirection === 'asc' ? 'desc' : 'asc'
            )
          }
        >
          {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
        </button>
        <label htmlFor="exclude-na" className="exclude-na-label">
          <input
            type="checkbox"
            id="exclude-na"
            checked={excludeNA}
            onChange={(e) => setExcludeNA(e.target.checked)}
          />
          Exclude "N/A" Prices
        </label>
      </div>
      <div className="games-grid">
        {sortedGames.map((game) => (
          <Link to={`/games/${game.appid}`} key={game.appid} className="game-block">
            <img src={game.headerImage} alt={game.name} />
            <div className="game-info">
              <div className="game-title">{game.name}</div>
              <div className="game-price">
                {game.priceOverview?.finalFormatted || (game.isFree ? 'Free' : 'N/A')}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Footer /> {/* Add Footer */}
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

export default GamesPage;