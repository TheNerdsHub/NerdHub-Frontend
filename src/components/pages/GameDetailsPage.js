import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useDocumentTitle from 'hooks/useDocumentTitle';
import { getGameDetails, updateGameInfo, fetchUsernames, getGamePlaytime } from 'services/gameService';
import ContextMenu from 'components/common/ContextMenu';
import { handleCopyToClipboard } from 'utils/clipboard';
import 'styles/GameDetailsPage.css';

function GameDetailsPage() {
  const { appid } = useParams();
  const navigate = useNavigate();
  const [gameDetails, setGameDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usernames, setUsernames] = useState({});
  const [playtimeData, setPlaytimeData] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, userId: null });
  const [updateCount, setUpdateCount] = useState(0);
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [sortBy, setSortBy] = useState('playtime'); // 'playtime' or 'name'
  const [hoveredUser, setHoveredUser] = useState(null);
  
  useDocumentTitle(gameDetails ? `${gameDetails.name}` : 'Game Details');

  const fetchGameDetails = useCallback(async () => {
    try {
      const data = await getGameDetails(appid);
      console.log('Game details received:', data);
      setGameDetails(data);

      if (data.ownedBy?.steamId?.length > 0) {
        const steamIds = data.ownedBy.steamId;
        const fetchedUsernames = await fetchUsernames(steamIds);
        setUsernames(fetchedUsernames);
      }

      // Try to fetch playtime data separately
      try {
        const playtimeResponse = await getGamePlaytime(appid);
        console.log('Playtime data received:', playtimeResponse);
        setPlaytimeData(playtimeResponse);
      } catch (playtimeError) {
        console.log('No playtime data available or error:', playtimeError);
        // Check if game details include playtime data
        if (data.playtime_by_user && Object.keys(data.playtime_by_user).length > 0) {
          console.log('Using playtime data from game details:', data.playtime_by_user);
          setPlaytimeData(data);
        } else {
          console.log('No playtime data found in game details either');
          setPlaytimeData(null);
        }
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

  // Debug effect to log playtime data changes
  useEffect(() => {
    console.log('Playtime data changed:', playtimeData);
    if (playtimeData) {
      console.log('Playtime by user:', playtimeData.playtime_by_user);
    }
  }, [playtimeData]);

  // Helper function to calculate total playtime from all users
  const calculateTotalPlaytime = (playtimeByUser) => {
    if (!playtimeByUser) return 0;
    return Object.values(playtimeByUser).reduce((total, userData) => {
      return total + (userData.playtime_forever || 0);
    }, 0);
  };

  // Helper function to get the most recent last played date
  const getLastPlayedDate = (playtimeByUser) => {
    if (!playtimeByUser) return null;
    
    const lastPlayedTimes = Object.values(playtimeByUser)
      .map(userData => userData.rtime_last_played)
      .filter(time => time > 0);
    
    if (lastPlayedTimes.length === 0) return null;
    
    const mostRecent = Math.max(...lastPlayedTimes);
    return new Date(mostRecent * 1000);
  };

  // Toggle user expansion
  const toggleUserExpansion = (steamId) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(steamId)) {
        newSet.delete(steamId);
      } else {
        newSet.add(steamId);
      }
      return newSet;
    });
  };

  const handleUpdateGameInfo = async () => {
    try {
      await updateGameInfo(appid);
      alert('Game info updated successfully.');
      fetchGameDetails();
    } catch (error) {
      alert('Failed to update game info.');
    }
  };

  // Sort users based on current sort option
  const sortUsers = (playtimeByUser) => {
    const userEntries = Object.entries(playtimeByUser);
    
    return userEntries.sort(([steamIdA, userDataA], [steamIdB, userDataB]) => {
      if (sortBy === 'playtime') {
        // Sort by playtime (descending)
        return userDataB.playtime_forever - userDataA.playtime_forever;
      } else {
        // Sort by name (ascending)
        const nameA = usernames[steamIdA]?.nickname || usernames[steamIdA]?.username || `User ${steamIdA}`;
        const nameB = usernames[steamIdB]?.nickname || usernames[steamIdB]?.username || `User ${steamIdB}`;
        return nameA.localeCompare(nameB);
      }
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
            {/* Categories */}
            {gameDetails.categories?.length > 0 && (
              <div>
                <strong>Categories:</strong>
                <ul className="tag-list">
                  {gameDetails.categories.map((category, index) => (
                    <li key={index}>{category.description}</li>
                ))}
                </ul>
              </div>
            )}
            {/* Genres */}
            {gameDetails.genres?.length > 0 && (
              <div>
                <strong>Genres:</strong>
                <ul className="tag-list">
                  {gameDetails.genres.map((genre, index) => (
                    <li key={index}>{genre.description}</li>
                  ))}
                </ul>
              </div>
              )}
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

          {/* Playtime Data */}
          {playtimeData && playtimeData.playtime_by_user && Object.keys(playtimeData.playtime_by_user).length > 0 ? (
            <div className="game-details-info-block">
              <h2>Playtime Statistics</h2>
              
              {/* Total Playtime Summary */}
              <div className="total-playtime-summary">
                <p className="total-playtime">
                  <strong>Total Playtime (All Users):</strong> {formatPlaytime(calculateTotalPlaytime(playtimeData.playtime_by_user))}
                </p>
                {getLastPlayedDate(playtimeData.playtime_by_user) && (
                  <p>
                    <strong>Last Played:</strong> {getLastPlayedDate(playtimeData.playtime_by_user).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              {/* Per-User Playtime Breakdown */}
              <div className="playtime-breakdown">
                <div className="playtime-header">
                  <h3>Playtime by User ({Object.keys(playtimeData.playtime_by_user).length} user{Object.keys(playtimeData.playtime_by_user).length !== 1 ? 's' : ''}):</h3>
                  <div className="sort-controls">
                    <label>Sort by: </label>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="sort-select"
                    >
                      <option value="playtime">Playtime</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                </div>
                <div className="playtime-users">
                  {sortUsers(playtimeData.playtime_by_user).map(([steamId, userData]) => (
                    <div 
                      key={steamId} 
                      className="user-playtime"
                      onMouseEnter={() => setHoveredUser(steamId)}
                      onMouseLeave={() => setHoveredUser(null)}
                    >
                      <div 
                        className="user-playtime-header" 
                        onClick={() => toggleUserExpansion(steamId)}
                        style={{ cursor: 'pointer' }}
                      >
                        <h4>
                          {(usernames[steamId]?.nickname || usernames[steamId]?.username || `User ${steamId}`)}
                          <span className="expand-icon">
                            {expandedUsers.has(steamId) ? ' ▼' : ' ▶'}
                          </span>
                        </h4>
                        <p><strong>Total:</strong> {formatPlaytime(userData.playtime_forever)}</p>
                        {userData.rtime_last_played > 0 && (
                          <p><strong>Last Played:</strong> {new Date(userData.rtime_last_played * 1000).toLocaleDateString()}</p>
                        )}
                      </div>

                      {/* Hover tooltip with full user details */}
                      {hoveredUser === steamId && (
                        <div className="user-hover-tooltip">
                          {usernames[steamId]?.nickname && (
                            <div><strong>Nickname:</strong> {usernames[steamId].nickname}</div>
                          )}
                          {usernames[steamId]?.username && (
                            <div><strong>Username:</strong> {usernames[steamId].username}</div>
                          )}
                          <div><strong>Steam ID:</strong> {steamId}</div>
                          <div><strong>Total Playtime:</strong> {formatPlaytime(userData.playtime_forever)}</div>
                          {userData.rtime_last_played > 0 && (
                            <div><strong>Last Played:</strong> {new Date(userData.rtime_last_played * 1000).toLocaleDateString()}</div>
                          )}
                        </div>
                      )}
                      
                      {/* Expandable Platform breakdown for this user */}
                      {expandedUsers.has(steamId) && (
                        <div className="user-platform-breakdown">
                          <h5>Platform Breakdown:</h5>
                          <div className="platform-details">
                            {userData.playtime_windows_forever > 0 && (
                              <p><strong>Windows:</strong> {formatPlaytime(userData.playtime_windows_forever)}</p>
                            )}
                            {userData.playtime_mac_forever > 0 && (
                              <p><strong>Mac:</strong> {formatPlaytime(userData.playtime_mac_forever)}</p>
                            )}
                            {userData.playtime_linux_forever > 0 && (
                              <p><strong>Linux:</strong> {formatPlaytime(userData.playtime_linux_forever)}</p>
                            )}
                            {userData.playtime_deck_forever > 0 && (
                              <p><strong>Steam Deck:</strong> {formatPlaytime(userData.playtime_deck_forever)}</p>
                            )}
                            {userData.playtime_disconnected > 0 && (
                              <p><strong>Offline:</strong> {formatPlaytime(userData.playtime_disconnected)}</p>
                            )}
                            {/* Show message if no platform-specific data */}
                            {userData.playtime_windows_forever === 0 && 
                             userData.playtime_mac_forever === 0 && 
                             userData.playtime_linux_forever === 0 && 
                             userData.playtime_deck_forever === 0 && 
                             userData.playtime_disconnected === 0 && (
                              <p style={{ fontStyle: 'italic', color: '#666' }}>No platform-specific data available</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="game-details-info-block">
              <h2>Playtime Statistics</h2>
              <p>No playtime data available for this game.</p>
            </div>
          )}

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

  function formatPlaytime(minutes) {
    if (!minutes || minutes === 0) return '0m';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;
    
    return `${hours}h ${remainingMinutes}m`;
  }
}

export default GameDetailsPage;
