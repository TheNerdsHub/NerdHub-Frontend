import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import useDocumentTitle from 'hooks/useDocumentTitle';
import { getGames } from 'services/gameService';
import api from 'utils/api';
import 'styles/GamesPage.css';
import { FaSearch, FaUserFriends, FaTags, FaSortAmountDown, FaFilter, FaChevronRight, FaChevronLeft } from 'react-icons/fa';

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
  const [onlyOnSale, setOnlyOnSale] = useState(false);
  const [excludeLowOwners, setExcludeLowOwners] = useState(() => JSON.parse(localStorage.getItem('excludeLowOwners')) ?? false);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const observer = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
    localStorage.setItem('excludeLowOwners', excludeLowOwners);
  }, [excludeLowOwners]);

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

  useEffect(() => {
    // Force a re-render by updating the state or triggering a layout recalculation
    const dropdownElement = document.querySelector('.owners-filter .css-13cymwt-control');
    if (dropdownElement) {
      dropdownElement.style.height = 'auto';
    }
  }, [selectedOwners]);

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
    )
    .filter((game) =>
      !onlyOnSale || (game.priceOverview?.discountPercent != null && game.priceOverview.discountPercent > 0)
    )
    .filter((game) => !excludeNA || !(game.priceOverview?.finalFormatted == null && !game.isFree))
    .filter((game) => !excludeLowOwners || (game.ownedBy?.steamId?.length ?? 0) >= 2);

  const sortedGames = [...filteredGames]
    .sort((a, b) => {
      let comparison = 0;
      
      // Define price comparison function for reuse as fallback
      const comparePrices = (gameA, gameB) => {
        const aIsNA = gameA.priceOverview?.finalFormatted == null && !gameA.isFree;
        const bIsNA = gameB.priceOverview?.finalFormatted == null && !gameB.isFree;
        const aIsFree = gameA.isFree;
        const bIsFree = gameB.isFree;
        
        // Handle special cases first
        if (aIsNA && !bIsNA) {
          return -1; // N/A comes first in ascending
        } else if (!aIsNA && bIsNA) {
          return 1; // N/A comes first in ascending
        } else if (aIsFree && !bIsFree && !bIsNA) {
          return -1; // Free comes before priced games
        } else if (!aIsFree && !aIsNA && bIsFree) {
          return 1; // Free comes before priced games
        } else {
          // Both have prices or both are free or both are N/A
          const priceA = gameA.priceOverview?.final || 0;
          const priceB = gameB.priceOverview?.final || 0;
          return priceA - priceB;
        }
      };

      // Primary sort
      if (sortBy === 'appid') {
        comparison = a.appid - b.appid;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        comparison = comparePrices(a, b);
      } else if (sortBy === 'discount') {
        const discountA = a.priceOverview?.discountPercent || 0;
        const discountB = b.priceOverview?.discountPercent || 0;
        comparison = discountA - discountB;
        // If discount percentages are identical, fall back to price
        if (comparison === 0) {
          comparison = comparePrices(a, b);
        }
      } else if (sortBy === 'owners') {
        const ownersA = a.ownedBy?.steamId?.length || 0;
        const ownersB = b.ownedBy?.steamId?.length || 0;
        comparison = ownersA - ownersB;
        // If owner counts are identical, fall back to price
        if (comparison === 0) {
          comparison = comparePrices(a, b);
        }
      } else if (sortBy === 'lastModified') {
        const timeA = a.lastModifiedTime ? new Date(a.lastModifiedTime).getTime() : 0;
        const timeB = b.lastModifiedTime ? new Date(b.lastModifiedTime).getTime() : 0;
        comparison = timeA - timeB;
        // If modification times are identical, fall back to price
        if (comparison === 0) {
          comparison = comparePrices(a, b);
        }
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
        value: steamId,
        label: user ? (user.nickname || user.username) : steamId
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const uniqueCategories = Array.from(
    new Set(games.flatMap((game) => game.categories?.map((category) => category.description) || []))
  )
    .map((category) => ({ value: category, label: category }))
    //.sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label if wanted

  const selectAllOwners = () => {
    setSelectedOwners(uniqueOwners.map(owner => owner.value));
  };

  const sortOptions = [
    { value: 'appid', label: 'App ID' },
    { value: 'discount', label: 'Discount' },
    { value: 'lastModified', label: 'Last Updated' },
    { value: 'name', label: 'Name' },
    { value: 'owners', label: 'Owners' },
    { value: 'price', label: 'Price' }
  ];

  return (
    <div className="games-page-wrapper">
      <div className="background-dots background-dots-back"></div>
      <div className="background-dots background-dots-front"></div>

      <div className="main-content">
        <aside className={`games-sidebar${sidebarOpen ? ' open' : ' collapsed'}`}>
          {/* Toggle button that's always visible */}
          <button 
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>

          {/* Collapsed: vertical icons */}
          {!sidebarOpen && (
            <div className="sidebar-icons-vertical">
              <div className="sidebar-icon" title="Search"><FaSearch /></div>
              <div className="sidebar-icon" title="Filter by owners"><FaUserFriends /></div>
              <div className="sidebar-icon" title="Categories"><FaTags /></div>
              <div className="sidebar-icon" title="Sort options"><FaSortAmountDown /></div>
              <div className="sidebar-icon" title="Additional filters"><FaFilter /></div>
            </div>
          )}

          {/* Expanded: icon + control rows */}
          {sidebarOpen && (
            <div className="sidebar-controls">
              {/* Search */}
              <div className="sidebar-row">
                <FaSearch className="sidebar-row-icon" />
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search games..."
                  className="sidebar-input"
                />
              </div>

              {/* Owners */}
              <div className="sidebar-row">
                <FaUserFriends className="sidebar-row-icon" />
                <div className="sidebar-row-flex">
                  <Select
                    isMulti
                    options={uniqueOwners}
                    value={uniqueOwners.filter((owner) =>
                      selectedOwners.includes(owner.value)
                    )}
                    onChange={(selectedOptions) => {
                      setSelectedOwners(selectedOptions.map((option) => option.value));
                    }}
                    menuPortalTarget={portalTarget}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    className="sidebar-select"
                  />
                  <button className="mini-button" onClick={selectAllOwners}>
                    Select All
                  </button>
                </div>
              </div>

              {/* Sort By */}
              <div className="sidebar-row">
                <FaTags className="sidebar-row-icon" />
                <div className="sidebar-row-flex">
                  <Select
                    options={sortOptions}
                    value={sortOptions.find(option => option.value === sortBy)}
                    onChange={(selectedOption) => setSortBy(selectedOption.value)}
                    menuPortalTarget={portalTarget}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    className="sidebar-select"
                  />
                  <button
                    className="sort-direction-button"
                    onClick={() =>
                      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                    }
                  >
                    {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="sidebar-row">
                <FaSortAmountDown className="sidebar-row-icon" />
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
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  className="sidebar-select"
                />
              </div>

              {/* Filters */}
              <div className="sidebar-row">
                <FaFilter className="sidebar-row-icon" />
                <div className="sidebar-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      id="exclude-na"
                      checked={excludeNA}
                      onChange={(e) => setExcludeNA(e.target.checked)}
                    />
                    Exclude "N/A" Prices
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      id="only-on-sale"
                      checked={onlyOnSale}
                      onChange={(e) => setOnlyOnSale(e.target.checked)}
                    />
                    Only On Sale
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      id="exclude-low-owners"
                      checked={excludeLowOwners}
                      onChange={(e) => setExcludeLowOwners(e.target.checked)}
                    />
                    Only Games Owned By 2+ People
                  </label>
                </div>
              </div>

              {/* Games Counter */}
              <div className="games-counter">
                <span>
                  {filteredGames.length !== games.length
                    ? `${sortedGames.length} / ${games.length} Games`
                    : `${games.length} Games`}
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* Games grid */}
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
                <div className="game-price">
                  {game.priceOverview ? (
                    game.priceOverview.finalFormatted !== game.priceOverview.initialFormatted && game.priceOverview.initialFormatted !== "" ? (
                      <>
                        <span className="discounted-price">{game.priceOverview.finalFormatted}</span>
                        <span className="original-price">{game.priceOverview.initialFormatted}</span>
                        <span className="discount-percent">-{game.priceOverview.discountPercent}%</span>
                      </>
                    ) : (
                      game.priceOverview.finalFormatted
                    )
                  ) : (
                    game.isFree ? 'Free' : 'N/A'
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GamesPage;
