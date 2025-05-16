import React, { useState, useEffect, useRef, useCallback } from 'react';
import useDocumentTitle from 'hooks/useDocumentTitle';
import Select from 'react-select';
import api from 'utils/api';
import 'styles/AdminPage.css';
import ContextMenu from 'components/common/ContextMenu';
import { handleCopyToClipboard } from 'utils/clipboard';
import ScrollToTop from 'components/common/ScrollToTop';

function AdminPage() {
  useDocumentTitle('Admin');
  const [steamIds, setSteamIds] = useState('');
  const [overrideExisting, setOverrideExisting] = useState(false);
  const [appIdsToUpdate, setAppIdsToUpdate] = useState('');
  const [userMappings, setUserMappings] = useState([]);
  const [sortedMappings, setSortedMappings] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'nickname', direction: 'asc' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressPhase, setProgressPhase] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const progressIntervalRef = useRef(null);

  const [mappingFormState, setMappingFormState] = useState({
    steamId: '',
    username: '',
    nickname: ''
  });
  const [selectedMapping, setSelectedMapping] = useState(null);


  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, mapping: null });
  const contextMenuRef = useRef(null);

  const autoResizeTextarea = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight + 2}px`;
  };

  const handleSteamIdsChange = (e) => {
    setSteamIds(e.target.value);
    autoResizeTextarea(e);
  };

  const handleAppIdsChange = (e) => {
    setAppIdsToUpdate(e.target.value);
    autoResizeTextarea(e);
  };

  useEffect(() => {
    const steamIdsTextarea = document.getElementById('steamIds');
    if (steamIdsTextarea) {
      steamIdsTextarea.style.height = 'auto';
      steamIdsTextarea.style.height = `${steamIdsTextarea.scrollHeight + 2}px`;
    }
  }, [steamIds]);

  useEffect(() => {
    const appIdsTextarea = document.getElementById('appIdsToUpdate');
    if (appIdsTextarea) {
      appIdsTextarea.style.height = 'auto';
      appIdsTextarea.style.height = `${appIdsTextarea.scrollHeight + 2}px`;
    }
  }, [appIdsToUpdate]);

  // Poll the backend for progress
  const pollProgress = (operationId) => {
    setShowProgress(true);

    let nextDelay = 1000;

    const poll = async () => {
      try {
        const response = await api.get(`/api/Games/update-progress/${operationId}`);
        const { progress, phase, message, retryAfterSeconds } = response;

        setProgress(progress);
        setProgressPhase(phase);
        setProgressMessage(message);

        if (progress >= 100) {
          setProgressPhase('Update completed!');
          setProgressMessage('');
          setLoading(false);

          // Fetch the final result and display it
          try {
            const resultResponse = await api.get(`/api/Games/update-result/${operationId}`);
            setResult(resultResponse);
          } catch (err) {
            setError('Failed to fetch update result');
          }
          return;
        }

        // Use backend-provided delay if present
        nextDelay = retryAfterSeconds ? retryAfterSeconds * 1000 : 1000;
      } catch (error) {
        console.error('Error fetching progress:', error);
        setError('Failed to fetch progress');
        setLoading(false);
        return;
      }
      progressIntervalRef.current = setTimeout(poll, nextDelay);
    };

    poll();
  };

  useEffect(() => {
    fetchUserMappings();

    return () => {
      const currentInterval = progressIntervalRef.current;
      if (currentInterval) {
        clearInterval(currentInterval);
      }
    };
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const sortMappings = useCallback(() => {
    const sorted = [...userMappings].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    setSortedMappings(sorted);
  }, [userMappings, sortConfig]);

  useEffect(() => {
    sortMappings();
  }, [userMappings, sortConfig, sortMappings]);

  const fetchUserMappings = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/Games/get-all-usernames');
      setUserMappings(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user mappings:', error);
      setError('Failed to fetch user mappings');
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSubmitUpdateGames = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const appIdsArray = appIdsToUpdate
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));

      const queryParams = new URLSearchParams();
      queryParams.append('overrideExisting', overrideExisting);
      appIdsArray.forEach(id => queryParams.append('appIdsToUpdate', id));

      const response = await api.post(`/api/Games/start-update?${queryParams.toString()}`, steamIds);
      const { operationId } = response;

      pollProgress(operationId);
    } catch (error) {
      console.error('Error starting update:', error);
      setError(error.message || 'Failed to start update');
      setLoading(false);
    }
  };

  const handleAddOrUpdateMapping = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/Games/add-or-update-user-mapping', {
        steamId: mappingFormState.steamId,
        username: mappingFormState.username,
        nickname: mappingFormState.nickname || null
      });
      
      setMappingFormState({
        steamId: '',
        username: '',
        nickname: ''
      });
      
      await fetchUserMappings();
    } catch (error) {
      console.error('Error updating user mapping:', error);
      setError(error.message || 'Failed to update user mapping');
    } finally {
      setLoading(false);
    }
  };

  const handleMappingSelect = (option) => {
    setSelectedMapping(option);
    
    if (option) {
      const mapping = userMappings.find(m => m.steamId === option.value);
      
      if (mapping) {
        setMappingFormState({
          steamId: mapping.steamId,
          username: mapping.username,
          nickname: mapping.nickname || ''
        });
      }
    } else {
      handleClearMapping();
    }
  };

  const handleClearMapping = () => {
    setSelectedMapping(null);
    setMappingFormState({
      steamId: '',
      username: '',
      nickname: ''
    });
  };

  const handleSelectAllSteamIds = () => {
    const allSteamIds = userMappings.map(mapping => mapping.steamId).join(', ');
    setSteamIds(allSteamIds);
  };

  const handleClearSteamIds = () => {
    setSteamIds('');
  };

  const handleClearAppIds = () => {
    setAppIdsToUpdate('');
  };

  const handleContextMenu = (e, mapping) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      mapping,
    });
  };

  const handleClickOutside = (e) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
      setContextMenu({ visible: false, x: 0, y: 0, mapping: null });
    }
  };

  const handleRowClick = (mapping) => {
    const option = mappingOptions.find(opt => opt.value === mapping.steamId);
    
    setSelectedMapping(option);
    
    setMappingFormState({
      steamId: mapping.steamId,
      username: mapping.username,
      nickname: mapping.nickname || ''
    });
  };

  const contextMenuOptions = [
    {
      label: 'Copy Steam ID',
      onClick: () => {
        handleCopyToClipboard(contextMenu.mapping.steamId);
        setContextMenu({ visible: false, x: 0, y: 0, mapping: null });
      },
    },
    {
      label: 'Copy Username',
      onClick: () => {
        handleCopyToClipboard(contextMenu.mapping.username);
        setContextMenu({ visible: false, x: 0, y: 0, mapping: null });
      },
    },
    {
      label: 'Copy Nickname',
      onClick: () => {
        handleCopyToClipboard(contextMenu.mapping.nickname || '—');
        setContextMenu({ visible: false, x: 0, y: 0, mapping: null });
      },
    },
    {isDivider: true},
    {
      label: 'Delete Mapping',
      onClick: () => {
        console.log('Delete mapping:', contextMenu.mapping);
        setContextMenu({ visible: false, x: 0, y: 0, mapping: null });
      },
    },
  ];

  const mappingOptions = userMappings.map(mapping => ({
    value: mapping.steamId,
    label: `${mapping.nickname || mapping.username} (${mapping.steamId})`
  })).sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="admin-page">
      <div className="background-dots background-dots-back"></div>
      <div className="background-dots background-dots-front"></div>

      <div className="admin-container">
        <h1>Admin Dashboard</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="admin-section">
          <h2>Update Owned Games</h2>
          <form onSubmit={handleSubmitUpdateGames}>
            <div className="form-group">
              <label htmlFor="steamIds">Steam IDs (comma separated):</label>
              <textarea
                id="steamIds"
                value={steamIds}
                onChange={handleSteamIdsChange}
                placeholder="76561198000000000, 76561198000000001"
                required
              />
              <div className="button-group">
                <button
                  type="button"
                  onClick={handleSelectAllSteamIds}
                  className="small-button"
                >
                  Select All Steam IDs
                </button>
                <button
                  type="button"
                  onClick={handleClearSteamIds}
                  className="small-button"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="appIdsToUpdate">App IDs to Update (optional, comma separated):</label>
              <textarea
                id="appIdsToUpdate"
                value={appIdsToUpdate}
                onChange={handleAppIdsChange}
                placeholder="220,440,570"
              />
              <div className="button-group">
                <button
                  type="button"
                  onClick={handleClearAppIds}
                  className="small-button"
                >
                  Clear
                </button>
              </div>
              <small>Leave blank to update all games owned by the Steam IDs</small>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="overrideExisting"
                checked={overrideExisting}
                onChange={(e) => setOverrideExisting(e.target.checked)}
              />
              <label htmlFor="overrideExisting">Override Existing Game Data</label>
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Update Games'}
            </button>
          </form>

          {showProgress && (
            <div className="progress-container">
              <div className="progress-header">
                <h4>{progressPhase}</h4>
                <p>{progressMessage}</p>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${progress}%` }}
                  data-progress={`${progress}%`}
                ></div>
              </div>
              <div className="progress-note">
                <small>This operation may take several minutes depending on the number of games.</small>
              </div>
            </div>
          )}

          {result && (
            <div className="result-container">
              <h3>Update Results:</h3>
              <pre>{JSON.stringify(result, null, 2)}</pre>
              <div className="result-summary">
                <div className="result-item">
                  <span className="result-label">Total Games:</span>
                  <span className="result-value">{result.totalGamesCount || 0}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Updated:</span>
                  <span className="result-value success">{result.updatedGamesCount || 0}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Skipped:</span>
                  <span className="result-value info">{result.skippedGamesCount || 0}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Failed:</span>
                  <span className="result-value error">{result.failedGamesCount || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="admin-section">
          <h2>Manage User Mappings</h2>
          
          <div className="user-mapping-select">
            <label>Select User to Edit:</label>
            <div className="select-container">
              <Select
                options={mappingOptions}
                value={selectedMapping}
                onChange={handleMappingSelect}
                isClearable
                isSearchable
                placeholder="Select a user..."
              />
            </div>
          </div>

          <form onSubmit={handleAddOrUpdateMapping}>
            <div className="form-group">
              <label htmlFor="steamId">Steam ID:</label>
              <input
                type="text"
                id="steamId"
                value={mappingFormState.steamId}
                onChange={(e) => setMappingFormState({...mappingFormState, steamId: e.target.value})}
                required
                placeholder="76561198000000000"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={mappingFormState.username}
                onChange={(e) => setMappingFormState({...mappingFormState, username: e.target.value})}
                required
                placeholder="SteamUsername"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="nickname">Nickname (optional):</label>
              <input
                type="text"
                id="nickname"
                value={mappingFormState.nickname}
                onChange={(e) => setMappingFormState({...mappingFormState, nickname: e.target.value})}
                placeholder="User's preferred name"
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (selectedMapping ? 'Update User' : 'Add User')}
            </button>
          </form>
        </div>

        <div className="admin-section">
          <h2>User Mappings</h2>
          {sortedMappings.length === 0 ? (
            <p>No user mappings found.</p>
          ) : (
            <div className="mappings-table-container">
              <table className="mappings-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('nickname')}>
                      Nickname {sortConfig.key === 'nickname' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('username')}>
                      Username {sortConfig.key === 'username' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('steamId')}>
                      Steam ID {sortConfig.key === 'steamId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMappings.map((mapping) => (
                    <tr
                      key={mapping.steamId}
                      onClick={() => handleRowClick(mapping)}
                      onContextMenu={(e) => handleContextMenu(e, mapping)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{mapping.nickname || '—'}</td>
                      <td>{mapping.username}</td>
                      <td>{mapping.steamId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ContextMenu
        ref={contextMenuRef}
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        options={contextMenuOptions}
        onClose={() => setContextMenu({ visible: false, x: 0, y: 0, mapping: null })}
      />
      
      <ScrollToTop />
    </div>
  );
}

export default AdminPage;