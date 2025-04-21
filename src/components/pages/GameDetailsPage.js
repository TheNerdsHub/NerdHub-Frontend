import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function GameDetailsPage() {
  const { gameId } = useParams(); // Extract gameId from the URL
  const [gameDetails, setGameDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch game details from the backend
    const fetchGameDetails = async () => {
      try {
        const response = await fetch(`/api/games/${gameId}`);
        const data = await response.json();
        setGameDetails(data);
      } catch (error) {
        console.error('Failed to fetch game details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!gameDetails) {
    return <div>Game not found.</div>;
  }

  return (
    <div>
      <h1>{gameDetails.name}</h1>
      <img src={gameDetails.header_image} alt={gameDetails.name} />
      <p>{gameDetails.detailed_description}</p>
      <p><strong>Developers:</strong> {gameDetails.developers?.join(', ')}</p>
      <p><strong>Publishers:</strong> {gameDetails.publishers?.join(', ')}</p>
      <p><strong>Genres:</strong> {gameDetails.genres?.map(genre => genre.description).join(', ')}</p>
      <p><strong>Release Date:</strong> {gameDetails.release_date?.date}</p>
    </div>
  );
}

export default GameDetailsPage;