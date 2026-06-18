/// <reference types="node" />
import { Router } from 'express'
import { PortfolioController } from '../controllers/portfolio.controller'
import { authenticate } from '../middleware/auth'

const router = Router()
const portfolioController = new PortfolioController()

router.get('/', authenticate, (req, res) => portfolioController.getPortfolio(req as any, res))
router.get('/summary', authenticate, (req, res) => portfolioController.getPortfolioSummary(req as any, res))
router.get('/holdings', authenticate, (req, res) => portfolioController.getHoldings(req as any, res))
router.get('/transactions', authenticate, (req, res) => portfolioController.getTransactionHistory(req as any, res))

export default router