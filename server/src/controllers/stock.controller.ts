/// <reference types="node" />
import { Request, Response } from 'express'
import { StockService } from '../services/stock.service'

const stockService = new StockService()

export class StockController {
  async getAllStocks(req: Request, res: Response): Promise<void> {
    try {
      const stocks = await stockService.getAllStocks()
      res.status(200).json({
        success: true,
        message: 'Stocks fetched successfully',
        data: stocks,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch stocks',
      })
    }
  }

  async getStockBySymbol(req: Request, res: Response): Promise<void> {
    try {
      const symbol = req.params.symbol as string
      const stock = await stockService.getStockBySymbol(symbol)
      res.status(200).json({
        success: true,
        message: 'Stock fetched successfully',
        data: stock,
      })
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Stock not found',
      })
    }
  }

  async searchStocks(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query
      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
        })
        return
      }
      const stocks = await stockService.searchStocks(q)
      res.status(200).json({
        success: true,
        message: 'Search results',
        data: stocks,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Search failed',
      })
    }
  }

  async getStocksBySector(req: Request, res: Response): Promise<void> {
    try {
      const sector = req.params.sector as string
      const stocks = await stockService.getStocksBysector(sector)
      res.status(200).json({
        success: true,
        message: 'Stocks fetched by sector',
        data: stocks,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch stocks',
      })
    }
  }
}
