import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          })
          const { accessToken, refreshToken: newRefresh } = res.data.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefresh)
          original.headers.Authorization = `Bearer ${accessToken}`
          return api(original)
        } catch {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  refreshToken: (token: string) => api.post('/auth/refresh', { refreshToken: token }),
}

export const stockAPI = {
  getAll: () => api.get('/stocks'),
  getBySymbol: (symbol: string) => api.get(`/stocks/${symbol}`),
  search: (query: string) => api.get(`/stocks/search?q=${query}`),
  getBySector: (sector: string) => api.get(`/stocks/sector/${sector}`),
}

export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio'),
  getSummary: () => api.get('/portfolio/summary'),
  getHoldings: () => api.get('/portfolio/holdings'),
  getTransactions: () => api.get('/portfolio/transactions'),
}

export const orderAPI = {
  placeOrder: (data: any) => api.post('/orders', data),
  getOrders: () => api.get('/orders'),
  cancelOrder: (orderId: string) => api.delete(`/orders/${orderId}`),
}

export const watchlistAPI = {
  getWatchlist: () => api.get('/watchlist'),
  addToWatchlist: (stockId: string) => api.post('/watchlist', { stockId }),
  removeFromWatchlist: (stockId: string) => api.delete(`/watchlist/${stockId}`),
}

export default api