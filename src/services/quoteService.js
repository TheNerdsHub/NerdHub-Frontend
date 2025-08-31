import api from '../utils/api';

const quoteService = {
  getAllQuotes: async () => {
    return await api.get('/api/Quotes');
  },

  getRandomQuote: async () => {
    return await api.get('/api/Quotes/random');
  },

  getQuoteOfTheDay: async () => {
    return await api.get('/api/Quotes/daily');
  },

  deleteQuote: async (id) => {
    const response = await fetch(`${process.env.REACT_APP_API_ROOT}/api/Quotes/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`DELETE /api/Quotes/${id} failed: ${response.statusText}`);
    }
    return response.ok;
  },
};

export default quoteService;
