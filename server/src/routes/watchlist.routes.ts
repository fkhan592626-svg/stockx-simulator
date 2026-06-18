/// <reference types="node" />
import { Router } from 'express'
import { WatchlistController } from '../controllers/watchlist.controller'
import { authenticate } from '../middleware/auth'

const router = Router()
const watchlistController = new WatchlistController()

router.get('/', authenticate, (req, res) => watchlistController.getWatchlist(req as any, res))
router.post('/', authenticate, (req, res) => watchlistController.addToWatchlist(req as any, res))
router.delete('/:stockId', authenticate, (req, res) => watchlistController.removeFromWatchlist(req as any, res))

export default router