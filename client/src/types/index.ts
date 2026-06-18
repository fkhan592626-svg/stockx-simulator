export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  cashBalance: number
}

export interface Stock {
  id: string
  symbol: string
  name: string
  sector: string
  currentPrice: number
  previousClose: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  high52Week: number
  low52Week: number
  priceHistory?: PriceHistory[]
}

export interface PriceHistory {
  id: string
  stockId: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp: string
}

export interface Holding {
  id: string
  portfolioId: string
  stockId: string
  quantity: number
  averageBuyPrice: number
  totalCost: number
  currentValue: number
  pnl: number
  pnlPercent: number
  stock: Stock
}

export interface Portfolio {
  id: string
  userId: string
  totalValue: number
  totalCost: number
  totalPnL: number
  dayPnL: number
  holdings: Holding[]
}

export interface Order {
  id: string
  userId: string
  stockId: string
  orderType: 'BUY' | 'SELL'
  executionType: 'MARKET' | 'LIMIT'
  quantity: number
  remainingQuantity: number
  price: number
  status: 'PENDING' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED'
  createdAt: string
  stock: Stock
}

export interface Transaction {
  id: string
  buyerId: string
  sellerId: string
  stockId: string
  quantity: number
  executedPrice: number
  totalAmount: number
  timestamp: string
  stock: Stock
}

export interface Watchlist {
  id: string
  userId: string
  stockId: string
  createdAt: string
  stock: Stock
}

export interface PortfolioSummary {
  cashBalance: number
  totalValue: number
  totalCost: number
  totalPnL: number
  totalPortfolioValue: number
  holdingsCount: number
  bestPerforming: Holding[]
  worstPerforming: Holding[]
  holdings: Holding[]
}