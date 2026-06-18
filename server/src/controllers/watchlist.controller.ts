/// <reference types="node" />
import { Response } from 'express'
import { WatchlistService } from '../services/watchlist.service'
import { AuthRequest } from '../middleware/auth'

const watchlistService = new WatchlistService()

export class WatchlistController {
  async getWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
      }
      const watchlist = await watchlistService.getWatchlist(userId)
      res.status(200).json({
        success: true,
        message: 'Watchlist fetched successfully',
        data: watchlist,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch watchlist',
      })
    }
  }

  async addToWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
      }
      const { stockId } = req.body
      if (!stockId) {
        res.status(400).json({ success: false, message: 'stockId is required' })
        return
      }
      const watchlist = await watchlistService.addToWatchlist(userId, stockId)
      res.status(201).json({
        success: true,
        message: 'Stock added to watchlist',
        data: watchlist,
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add to watchlist',
      })
    }
  }

  async removeFromWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
      }
      const stockId = req.params.stockId as string
      await watchlistService.removeFromWatchlist(userId, stockId)
      res.status(200).json({
        success: true,
        message: 'Stock removed from watchlist',
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to remove from watchlist',
      })
    }
  }
}