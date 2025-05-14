import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useDocumentTitle from 'hooks/useDocumentTitle';
import { getGameDetails, updateGameInfo, fetchUsernames } from 'services/gameService';
import ContextMenu from 'components/common/ContextMenu';
import { handleCopyToClipboard } from 'utils/clipboard';
import 'styles/GameDetailsPage.css';

function GameDetailsPage() {
  const { appid } = useParams();
  const navigate = useNavigate();
  const [gameDetails, setGameDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usernames, setUsernames] = useState({});
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, userId: null });
  const [updateCount, setUpdateCount] = useState(0);
  
  useDocumentTitle(gameDetails ? `${gameDetails.name}` : 'Game Details');

  const fetchGameDetails = useCallback(async () => {
    try {
      const data = await getGameDetails(appid);
      setGameDetails(data);

      if (data.ownedBy?.steamId?.length > 0) {
        const steamIds = data.ownedBy.steamId;
        const fetchedUsernames = await fetchUsernames(steamIds);
        setUsernames(fetchedUsernames);
      }
      // Increment update count to trigger animation replay
      setUpdateCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to fetch game details:', error);
    } finally {
      setLoading(false);
    }
  }, [appid]);

  useEffect(() => {
    fetchGameDetails();
  }, [fetchGameDetails]);

  const handleUpdateGameInfo = async () => {
    try {
      await updateGameInfo(appid);
      alert('Game info updated successfully.');
      fetchGameDetails();
    } catch (error) {
      alert('Failed to update game info.');
    }
  };

  const handleContextMenu = (e, userId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      userId: userId,
      displayName: usernames[userId]?.nickname || usernames[userId]?.username || "Unknown User",
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, userId: null });
  };

  const handleOpenGamesSearch = (userId) => {
    navigate(`/games?owner=${userId}`);
    closeContextMenu();
  };

  useEffect(() => {
    const handleClickOutside = () => {
      closeContextMenu();
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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

  const contextMenuOptions = [
    {
      label: 'Copy SteamID',
      onClick: () => handleCopyToClipboard(contextMenu.userId),
    },
    {
      label: 'Copy Username',
      onClick: () =>
        handleCopyToClipboard(usernames[contextMenu.userId]?.username || 'Unknown User'),
    },
    {
      label: 'Copy Name',
      onClick: () => handleCopyToClipboard(contextMenu.displayName),
    },
    {
      label: 'Open Games Search',
      onClick: () => handleOpenGamesSearch(contextMenu.userId),
    },
  ];

  return (
    <div className="centered-container">
      {/* Background Dots */}
      <div key={`dots-back-${updateCount}`} className="background-dots background-dots-back"></div>
      <div key={`dots-front-${updateCount}`} className="background-dots background-dots-front"></div>

      {/* Game Details Card */}
      <div key={`game-details-${updateCount}`} className="game-details">
        {/* Back Button */}
        <Link to="/games" className="back-button">
          &larr; Back to Games
        </Link>
        
        {/* Header */}
        <div className="game-header">
          <img src={gameDetails.headerImage} alt={gameDetails.name} />
          <h1>{gameDetails.name}</h1>
        </div>

        {/* Action Buttons */}
        <div className="button-row">
          <button onClick={handleUpdateGameInfo}>Update Game Info</button>
          <a
            href={`https://store.steampowered.com/app/${gameDetails.appid}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Steam
          </a>
          <a
            href={`https://steamdb.info/app/${gameDetails.appid}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on SteamDB
          </a>
          <a
            href={`https://www.protondb.com/app/${gameDetails.appid}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on ProtonDB
          </a>
        </div>

        {/* Main Info Section */}
        <div className="game-details-info">

          {/* General Information */}
          <div className="game-details-info-block">
            <h2>General Information</h2>
            {gameDetails.priceOverview?.finalFormatted ? (
              <p><strong>Price: </strong> 
                {gameDetails.priceOverview.finalFormatted !== gameDetails.priceOverview.initialFormatted && gameDetails.priceOverview.initialFormatted !== "" ? (
                  <>
                    <span className="discounted-price"> {gameDetails.priceOverview.finalFormatted}</span>
                    <span className="original-price">{gameDetails.priceOverview.initialFormatted}</span>
                    <span className="discount-percent">-{gameDetails.priceOverview.discountPercent}%</span>
                  </>
                ) : (
                  gameDetails.priceOverview.finalFormatted
                )}
              </p>
            ) : gameDetails.isFree ? (
              <p><strong>Price:</strong> Free</p>
            ) : (
              <>
                <p><strong>Price:</strong> Not Available</p>
                <p><strong>Free to Play?</strong> {gameDetails.isFree ? 'Yes' : 'No'}</p>
              </>
            )}
            <p><strong>Categories:</strong> {gameDetails.categories?.map(category => category.description).join(', ')}</p>
            <p><strong>Genres:</strong> {gameDetails.genres?.map(genre => genre.description).join(', ')}</p>
            <p><strong>Release Date:</strong> {gameDetails.releaseDate?.date}</p>
          </div>

          {/* Description */}
          <div className="game-details-info-block">
            <h2>Description</h2>
            <p>{decodeHtml(gameDetails.shortDescription)}</p>
          </div>

          {/* Platforms */}
          <div className="game-details-info-block">
            <h2>Platforms & Controller Support</h2>
            <p><strong>Platforms:</strong> {platforms.join(', ')}</p>
            <p><strong>Controller Support:</strong> {gameDetails.controllerSupport || 'None'}</p>
          </div>

          {/* System Requirements */}
          <div className="game-details-info-block">
            <h2>System Requirements</h2>
            <p><strong>PC Requirements:</strong>{' '}
              {gameDetails.pcRequirements?.minimum ? (
                <span dangerouslySetInnerHTML={{ __html: ensureNewline(decodeHtml(gameDetails.pcRequirements.minimum)) }} />
              ) : ' Not available'}
            </p>

            {hasMac && (
              <p><strong>Mac Requirements:</strong>{' '}
                {gameDetails.macRequirements?.minimum ? (
                  <span dangerouslySetInnerHTML={{ __html: ensureNewline(decodeHtml(gameDetails.macRequirements.minimum)) }} />
                ) : ' Not available'}
              </p>
            )}

            {hasLinux && (
              <p><strong>Linux Requirements:</strong>{' '}
                {gameDetails.linuxRequirements?.minimum ? (
                  <span dangerouslySetInnerHTML={{ __html: ensureNewline(decodeHtml(gameDetails.linuxRequirements.minimum)) }} />
                ) : ' Not available'}
              </p>
            )}
          </div>

          {/* Owned By */}
          <div className="game-details-info-block">
            <h2>Owned By</h2>
            
            {/* Steam Users */}
            {gameDetails.ownedBy?.steamId?.length > 0 ? (
              <>
                <p>
                  <strong>Steam Users ({gameDetails.ownedBy.steamId.length}):</strong>
                </p>
                <ul className="owners-list">
                  {gameDetails.ownedBy.steamId
                    .map(id => ({
                      id,
                      displayName: usernames[id]?.nickname || usernames[id]?.username || "Unknown User",
                      username: usernames[id]?.username || "Unknown",
                      nickname: usernames[id]?.nickname || ""
                    }))
                    .sort((a, b) => a.displayName.localeCompare(b.displayName)) // Sort alphabetically by display name
                    .map((user, index) => (
                      <li 
                        key={index} 
                        className="owner-item"
                        onClick={() => handleOpenGamesSearch(user.id)}
                        onContextMenu={(e) => handleContextMenu(e, user.id)}
                        data-tooltip-id={`user-tooltip-${user.id}`}
                        style={{ cursor: 'pointer' }}
                      >
                        {user.displayName}
                        <div className="user-tooltip" id={`user-tooltip-${user.id}`}>
                          {user.nickname && <div className="tooltip-row"><span>Nickname:</span> {user.nickname}</div>}
                          <div className="tooltip-row"><span>Username:</span> {user.username}</div>
                          <div className="tooltip-row"><span>SteamID:</span> {user.id}</div>
                        </div>
                      </li>
                    ))}
                </ul>
              </>
            ) : (
              <p>No Steam users</p>
            )}

            {/* Epic Users */}
            {gameDetails.ownedBy?.epicId?.length > 0 && (
              <>
                <p>
                  <strong>Epic Users ({gameDetails.ownedBy.epicId.length}):</strong>
                </p>
                <ul className="owners-list">
                  {gameDetails.ownedBy.epicId.map((id, index) => (
                    <li key={index} className="owner-item">{id}</li>
                  ))}
                </ul>
              </>
            )}
            
            {/* Total Count */}
            <p className="total-owners">
              <strong>Total Owners:</strong> {
                (gameDetails.ownedBy?.steamId?.length || 0) + 
                (gameDetails.ownedBy?.epicId?.length || 0)
              }
            </p>
          </div>

          {/* Last Modified */}
          <div className="game-details-info-block">
            <h2>Last Modified</h2>
            <p>
              {gameDetails.lastModifiedTime
                ? new Date(gameDetails.lastModifiedTime).toLocaleString()
                : 'Not available'}
            </p>
          </div>

        </div>
      </div>

      {/* Context Menu */}
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        options={contextMenuOptions}
        onClose={closeContextMenu}
      />
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
