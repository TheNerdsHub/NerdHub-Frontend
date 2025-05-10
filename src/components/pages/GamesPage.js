import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import useDocumentTitle from 'hooks/useDocumentTitle';
import ScrollToTop from 'components/common/ScrollToTop';
import { getGames } from 'services/gameService';
import api from 'utils/api';
import 'styles/GamesPage.css';

function GamesPage() {
  useDocumentTitle('Games');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('sortBy') || 'owners');
  const [sortDirection, setSortDirection] = useState(() => localStorage.getItem('sortDirection') || 'desc');
  const [excludeNA, setExcludeNA] = useState(() => JSON.parse(localStorage.getItem('excludeNA')) ?? true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleGames, setVisibleGames] = useState(new Set());
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [portalTarget, setPortalTarget] = useState(null);
  const [userMappings, setUserMappings] = useState([]);

  const observer = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch games and usernames in parallel
        const [gamesData, userMappingsData] = await Promise.all([
          getGames(),
          api.get('/api/Games/get-all-usernames')
        ]);
        
        setGames(gamesData);
        setUserMappings(userMappingsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('sortBy', sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem('sortDirection', sortDirection);
  }, [sortDirection]);

  useEffect(() => {
    localStorage.setItem('excludeNA', excludeNA);
  }, [excludeNA]);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleGames((prev) => new Set(prev).add(entry.target.dataset.appid));
          }
        });
      },
      { threshold: 0.1 }
    );

    return () => observer.current.disconnect();
  }, []);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const filteredGames = games
    .filter((game) =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((game) =>
      selectedOwners.length === 0 ||
      (selectedOwners.every((owner) => 
        game.ownedBy?.steamId?.some((gameOwner) => 
          gameOwner === owner
        )
      ))
    )
    .filter((game) =>
      selectedCategories.length === 0 ||
      (selectedCategories.every((category) => 
        game.categories?.some((gameCategory) => 
          gameCategory.description === category
        )
      ))
    );

  const sortedGames = [...filteredGames]
    .filter((game) => !excludeNA || !(game.priceOverview?.finalFormatted == null && !game.isFree))
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

  const uniqueOwners = Array.from(
    new Set(games.flatMap((game) => game.ownedBy?.steamId || []))
  )
    .map((steamId) => {
      const user = userMappings.find(u => u.steamId === steamId);
      return {
        value: steamId, // Keep the value as steamId for filtering
        label: user ? (user.nickname || user.username) : steamId // Show nickname or username if available
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label

  const uniqueCategories = Array.from(
    new Set(games.flatMap((game) => game.categories?.map((category) => category.description) || []))
  )
    .map((category) => ({ value: category, label: category }))
    //.sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label if wanted

  // Add these functions to handle select all and clear
  const selectAllOwners = () => {
    setSelectedOwners(uniqueOwners.map(owner => owner.value));
  };

  const clearOwners = () => {
    setSelectedOwners([]);
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="games-page-wrapper">
      {/* Floating Background Layers */}
      <div className="background-dots background-dots-back"></div>
      <div className="background-dots background-dots-front"></div>

      {/* Main Content Wrapper */}
      <div className="main-content">
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
          <div className="owners-filter">
            <div className="filter-header">
              <label>Filter by Owners:</label>
              <div className="filter-buttons">
                <button 
                  className="filter-button" 
                  onClick={selectAllOwners}
                  type="button"
                >
                  Select All
                </button>
                <button 
                  className="filter-button" 
                  onClick={clearOwners}
                  type="button"
                >
                  Clear
                </button>
              </div>
            </div>
            <Select
              isMulti
              options={uniqueOwners}
              value={uniqueOwners.filter((owner) =>
                selectedOwners.includes(owner.value)
              )}
              onChange={(selectedOptions) =>
                setSelectedOwners(selectedOptions.map((option) => option.value))
              }
              menuPortalTarget={portalTarget}
              styles={{
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999
                })
              }}
            />
          </div>
          <div className="categories-filter">
            <div className="filter-header">
              <label>Filter by Categories:</label>
              <div className="filter-buttons">
                <button 
                  className="filter-button" 
                  onClick={clearCategories}
                  type="button"
                >
                  Clear
                </button>
              </div>
            </div>
            <Select
              isMulti
              options={uniqueCategories}
              value={uniqueCategories.filter((category) =>
                selectedCategories.includes(category.value)
              )}
              onChange={(selectedOptions) =>
                setSelectedCategories(selectedOptions.map((option) => option.value))
              }
              menuPortalTarget={portalTarget}
              styles={{
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999
                })
              }}
            />
          </div>
        </div>

        <div className="games-grid">
          {sortedGames.map((game, index) => (
            <Link
              to={`/games/${game.appid}`}
              key={game.appid}
              className={`game-block ${visibleGames.has(game.appid.toString()) ? 'fade-in' : ''}`}
              style={{ '--animation-delay': `${index * 0.05}s` }}
              data-appid={game.appid}
              ref={(el) => el && observer.current.observe(el)}
            >
              {game.isFree && <div className="ribbon">Free</div>}
              <img src={game.headerImage} alt={game.name} />
              <div className="game-info">
                <div className="game-title">{game.name}</div>
                <div
                  className="game-price"
                  data-price={game.priceOverview?.finalFormatted || (game.isFree ? 'Free' : 'N/A')}
                ></div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}

export default GamesPage;
