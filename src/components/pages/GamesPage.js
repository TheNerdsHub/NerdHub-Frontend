import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../useDocumentTitle';
import './GamesPage.css'; // Add CSS for grid styling

const API_ROOT = process.env.REACT_APP_API_ROOT;

function GamesPage() {
  useDocumentTitle('Games');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="games-grid">
      {games.map(game => (
        <Link to={`/games/${game.steam_appid}`} key={game.steam_appid} className="game-block">
          <img src={game.header_image} alt={game.name} />
          <div className="game-title">{game.name}</div>
        </Link>
      ))}
    </div>
  );
}

export default GamesPage;