/// <reference types="node" />
import { Router } from 'express'
import { OrderController } from '../controllers/order.controller'
import { authenticate } from '../middleware/auth'

const router = Router()
const orderController = new OrderController()

router.post('/', authenticate, (req, res) => orderController.placeOrder(req as any, res))
router.get('/', authenticate, (req, res) => orderController.getUserOrders(req as any, res))
router.delete('/:orderId', authenticate, (req, res) => orderController.cancelOrder(req as any, res))

export default router