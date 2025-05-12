import React, { useState, useEffect } from 'react';
import useDocumentTitle from 'hooks/useDocumentTitle';
import Select from 'react-select';
import api from 'utils/api';
import 'styles/AdminPage.css';

function AdminPage() {
  useDocumentTitle('Admin');
  const [steamIds, setSteamIds] = useState('');
  const [overrideExisting, setOverrideExisting] = useState(false);
  const [appIdsToUpdate, setAppIdsToUpdate] = useState('');
  const [userMappings, setUserMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // User mapping form states
  const [mappingFormState, setMappingFormState] = useState({
    steamId: '',
    username: '',
    nickname: ''
  });
  const [selectedMapping, setSelectedMapping] = useState(null);

  useEffect(() => {
    fetchUserMappings();
  }, []);

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

  const handleSubmitUpdateGames = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Parse appIds if provided
      let appIdsArray = null;
      if (appIdsToUpdate.trim()) {
        appIdsArray = appIdsToUpdate
          .split(',')
          .map(id => parseInt(id.trim()))
          .filter(id => !isNaN(id));
      }

      // Create query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('overrideExisting', overrideExisting);
      
      if (appIdsArray && appIdsArray.length > 0) {
        appIdsArray.forEach(id => queryParams.append('appIdsToUpdate', id));
      }

      const response = await api.post(
        `/api/Games/update-owned-games?${queryParams.toString()}`, 
        steamIds
      );
      
      setResult(response);
    } catch (error) {
      console.error('Error updating games:', error);
      setError(error.message || 'Failed to update games');
    } finally {
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
      
      // Clear form and refresh mappings
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
    const mapping = userMappings.find(m => m.steamId === option.value);
    
    if (mapping) {
      setMappingFormState({
        steamId: mapping.steamId,
        username: mapping.username,
        nickname: mapping.nickname || ''
      });
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

  const mappingOptions = userMappings.map(mapping => ({
    value: mapping.steamId,
    label: `${mapping.nickname || mapping.username} (${mapping.steamId})`
  }));

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
                onChange={(e) => setSteamIds(e.target.value)}
                placeholder="76561198000000000,76561198000000001"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="appIdsToUpdate">App IDs to Update (optional, comma separated):</label>
              <textarea
                id="appIdsToUpdate"
                value={appIdsToUpdate}
                onChange={(e) => setAppIdsToUpdate(e.target.value)}
                placeholder="220,440,570"
              />
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

          {result && (
            <div className="result-container">
              <h3>Update Results:</h3>
              <pre>{JSON.stringify(result, null, 2)}</pre>
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
              <button type="button" onClick={handleClearMapping} className="small-button">
                Clear
              </button>
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
          {userMappings.length === 0 ? (
            <p>No user mappings found.</p>
          ) : (
            <div className="mappings-table-container">
              <table className="mappings-table">
                <thead>
                  <tr>
                    <th>Steam ID</th>
                    <th>Username</th>
                    <th>Nickname</th>
                  </tr>
                </thead>
                <tbody>
                  {userMappings.map((mapping) => (
                    <tr key={mapping.steamId} onClick={() => handleMappingSelect({ value: mapping.steamId, label: mapping.username })}>
                      <td>{mapping.steamId}</td>
                      <td>{mapping.username}</td>
                      <td>{mapping.nickname || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;