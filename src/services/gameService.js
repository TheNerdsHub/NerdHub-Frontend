import api from 'utils/api';

export const getGameDetails = async (appid) => {
  return await api.get(`/api/Games/${appid}`);
};

export const updateGameInfo = async (appid) => {
  return await api.post(`/api/Games/update-game-info/${appid}`);
};

export const fetchUsernames = async (steamIds) => {
  return await api.post('/api/Games/get-usernames', steamIds);
};

export const getGames = async () => {
  return await api.get('/api/games');
};