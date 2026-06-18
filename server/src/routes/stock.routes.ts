/// <reference types="node" />
import { Router } from 'express'
import { StockController } from '../controllers/stock.controller'
import { authenticate } from '../middleware/auth'

const router = Router()
const stockController = new StockController()

router.get('/', authenticate, (req, res) => stockController.getAllStocks(req, res))
router.get('/search', authenticate, (req, res) => stockController.searchStocks(req, res))
router.get('/sector/:sector', authenticate, (req, res) => stockController.getStocksBySector(req, res))
router.get('/:symbol', authenticate, (req, res) => stockController.getStockBySymbol(req, res))

export default router