const API_ROOT = process.env.REACT_APP_API_ROOT;

const api = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_ROOT}${endpoint}`);
      if (!response.ok) {
        throw new Error(`GET ${endpoint} failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  post: async (endpoint, body) => {
    try {
      const response = await fetch(`${API_ROOT}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`POST ${endpoint} failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};

export default api;