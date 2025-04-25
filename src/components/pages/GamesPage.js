import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../useDocumentTitle';
import './GamesPage.css'; // Add CSS for grid styling

const API_ROOT = process.env.REACT_APP_API_ROOT;

function GamesPage() {
  useDocumentTitle('Games');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('sortBy') || 'appid'); // Load from localStorage or default to 'appid'
  const [sortDirection, setSortDirection] = useState(() => localStorage.getItem('sortDirection') || 'asc'); // Load from localStorage or default to 'asc'
  const [excludeNA, setExcludeNA] = useState(false); // New state for excluding "N/A" results

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

  // Save sortBy and sortDirection to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sortBy', sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem('sortDirection', sortDirection);
  }, [sortDirection]);

  // Sort and filter games based on the selected criterion, direction, and excludeNA
  const sortedGames = [...games]
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
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="sort-container">
        <label htmlFor="sort-by">Sort By:</label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="appid">App ID</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
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
    </div>
  );
}

export default GamesPage;