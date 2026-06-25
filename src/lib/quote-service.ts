import { api } from './api'

export interface Quote {
  id?: string
  quoteText: string
  quotedPersons: string[]
  submitter: string
  discordUserId?: string
  channelId?: string
  channelName?: string
  messageId?: string
  timestamp: string
}

export interface QuoteCategory {
  id?: string
  guildId: string
  categoryId: string
  categoryName: string
  createdAt?: string
  updatedAt?: string
}

export const quoteService = {
  getAllQuotes: () => api.get<Quote[]>('/api/Quotes'),

  getRandomQuote: () => api.get<Quote>('/api/Quotes/random'),

  getQuoteOfTheDay: () => api.get<Quote>('/api/Quotes/daily'),

  deleteQuote: (id: string) => api.delete<undefined>(`/api/Quotes/${id}`),

  getQuoteCategories: () => api.get<QuoteCategory[]>('/api/QuoteCategories'),
}
