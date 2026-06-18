/// <reference types="node" />
import { Response } from 'express'
import { PortfolioService } from '../services/portfolio.service'
import { AuthRequest } from '../middleware/auth'

const portfolioService = new PortfolioService()

export class PortfolioController {
  async getPortfolio(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
      }
      const portfolio = await portfolioService.getPortfolio(userId)
      res.status(200).json({
        success: true,
        message: 'Portfolio fetched successfully',
        data: portfolio,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch portfolio',
      })
    }
  }

  async getPortfolioSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
      }
      const summary = await portfolioService.getPortfolioSummary(userId)
      res.status(200).json({
        success: true,
        message: 'Portfolio summary fetched successfully',
        data: summary,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch portfolio summary',
      })
    }
  }

  async getHoldings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
      }
      const holdings = await portfolioService.getHoldings(userId)
      res.status(200).json({
        success: true,
        message: 'Holdings fetched successfully',
        data: holdings,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch holdings',
      })
    }
  }

  async getTransactionHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
      }
      const transactions = await portfolioService.getTransactionHistory(userId)
      res.status(200).json({
        success: true,
        message: 'Transactions fetched successfully',
        data: transactions,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch transactions',
      })
    }
  }
}