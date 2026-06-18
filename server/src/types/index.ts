/// <reference types="node" />

export interface JwtPayload {
  userId: string
  email: string
  username: string
}

export interface AuthRequest extends Express.Request {
  user?: JwtPayload
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface StockPrice {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: Date
}

export interface OrderMatchResult {
  matched: boolean
  executedPrice?: number
  executedQuantity?: number
  remainingQuantity?: number
}