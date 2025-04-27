import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useDocumentTitle from 'hooks/useDocumentTitle';
import { getGameDetails, updateGameInfo, fetchUsernames } from 'services/gameService';
import 'styles/GameDetailsPage.css';

function GameDetailsPage() {
  useDocumentTitle('Game Details');
  const { appid } = useParams();
  const [gameDetails, setGameDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usernames, setUsernames] = useState({});

  const fetchGameDetails = async () => {
    try {
      const data = await getGameDetails(appid);
      setGameDetails(data);

      // Fetch usernames for Steam IDs if they exist
      if (data.ownedBy?.steamId?.length > 0) {
        const steamIds = data.ownedBy.steamId;
        const fetchedUsernames = await fetchUsernames(steamIds);
        setUsernames(fetchedUsernames);
      }
    } catch (error) {
      console.error('Failed to fetch game details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGameInfo = async () => {
    try {
      await updateGameInfo(appid);
      alert('Game info updated successfully.');
      fetchGameDetails(); // Refresh game details after update
    } catch (error) {
      alert('Failed to update game info.');
    }
  };

  useEffect(() => {
    fetchGameDetails();
  }, [appid]);

  if (loading) {
    return <div className="centered-container">Loading...</div>;
  }

  if (!gameDetails) {
    return <div className="centered-container">Game not found.</div>;
  }

  const platforms = Object.entries(gameDetails.platforms || {})
    .filter(([key, value]) => value)
    .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

  const hasMac = platforms.includes('Mac');
  const hasLinux = platforms.includes('Linux');

  return (
    <div className="centered-container">
      <div className="game-details">
        <div className="game-header">
          <img src={gameDetails.headerImage} alt={gameDetails.name} />
          <h1>{gameDetails.name}</h1>
        </div>
        <button onClick={handleUpdateGameInfo}>Update Game Info</button>
        <p><strong>Link to Steam:</strong> <a href={`https://store.steampowered.com/app/${gameDetails.appid}`} target="_blank" rel="noopener noreferrer">Steam Page</a></p>
        {gameDetails.priceOverview?.finalFormatted ? (
          <p><strong>Price:</strong> {gameDetails.priceOverview.finalFormatted}</p>
        ) : gameDetails.isFree ? (
          <p><strong>Price:</strong> Free</p>
        ) : (
          <>
            <p><strong>Price:</strong> Not Available</p>
            <p><strong>Free to Play?</strong> {gameDetails.isFree ? 'Yes' : 'No'}</p>
          </>
        )}
        <p><strong>Categories:</strong> {gameDetails.categories?.map(category => category.description).join(', ')}</p>
        <p><strong>Description:</strong> {decodeHtml(gameDetails.shortDescription)}</p>
        <p><strong>Developers:</strong> {gameDetails.developers?.join(', ')}</p>
        <p><strong>Publishers:</strong> {gameDetails.publishers?.join(', ')}</p>
        <p><strong>Genres:</strong> {gameDetails.genres?.map(genre => genre.description).join(', ')}</p>
        <p><strong>Release Date:</strong> {gameDetails.releaseDate?.date}</p>
        <p><strong>Controller Support:</strong> {gameDetails.controllerSupport || 'None'}</p>
        <p><strong>Platforms:</strong> {platforms.join(', ')}</p>
        <p>
          <strong>PC Requirements:</strong>
          {gameDetails.pcRequirements?.minimum ? (
            <span dangerouslySetInnerHTML={{ __html: ensureNewline(decodeHtml(gameDetails.pcRequirements.minimum)) }} />
          ) : (
            ' Not available'
          )}
        </p>
        {hasMac && (
          <p>
            <strong>Mac Requirements:</strong>
            {gameDetails.macRequirements?.minimum ? (
              <span dangerouslySetInnerHTML={{ __html: ensureNewline(decodeHtml(gameDetails.macRequirements.minimum)) }} />
            ) : (
              ' Not available'
            )}
          </p>
        )}
        {hasLinux && (
          <p>
            <strong>Linux Requirements:</strong>
            {gameDetails.linuxRequirements?.minimum ? (
              <span dangerouslySetInnerHTML={{ __html: ensureNewline(decodeHtml(gameDetails.linuxRequirements.minimum)) }} />
            ) : (
              ' Not available'
            )}
          </p>
        )}
        <p>
          <strong>Owned By:</strong><br />
          <strong>Steam Users: </strong>
          {gameDetails.ownedBy?.steamId?.length > 0 ? (
            <ul>
              {gameDetails.ownedBy.steamId.map((id, index) => {
                const user = usernames[id];
                return (
                  <li key={index}>
                    {id} - {user?.nickname || user?.username || "Unknown User"}
                  </li>
                );
              })}
            </ul>
          ) : (
            'None'
          )}
        </p>
        {gameDetails.ownedBy?.epicId?.length > 0 && (
          <p>
            <strong>Epic Users: </strong>
            <ul>
              {gameDetails.ownedBy.epicId.map((id, index) => (
                <li key={index}>{id}</li>
              ))}
            </ul>
          </p>
        )}
        <p>
          <strong>Last Modified:</strong>{' '}
          {gameDetails.LastModifiedTime
            ? new Date(gameDetails.LastModifiedTime).toLocaleString()
            : 'Not available'}
        </p>
      </div>
    </div>
  );

  function decodeHtml(html) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = html;
    return textArea.value;
  }

  function ensureNewline(html) {
    if (!html.startsWith('\n')) {
      return `<br>${html}`;
    }
    return html;
  }
}

export default GameDetailsPage;