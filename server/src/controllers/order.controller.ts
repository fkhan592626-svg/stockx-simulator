/// <reference types="node" />
import { Response } from 'express'
import { OrderService } from '../services/order.service'
import { AuthRequest } from '../middleware/auth'
import { OrderType, ExecutionType } from '@prisma/client'

const orderService = new OrderService()

export class OrderController {
  async placeOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
      }

      const { stockId, orderType, executionType, quantity, price } = req.body

      if (!stockId || !orderType || !executionType || !quantity) {
        res.status(400).json({
          success: false,
          message: 'stockId, orderType, executionType and quantity are required',
        })
        return
      }

      if (!Object.values(OrderType).includes(orderType)) {
        res.status(400).json({
          success: false,
          message: 'orderType must be BUY or SELL',
        })
        return
      }

      if (!Object.values(ExecutionType).includes(executionType)) {
        res.status(400).json({
          success: false,
          message: 'executionType must be MARKET or LIMIT',
        })
        return
      }

      if (executionType === ExecutionType.LIMIT && !price) {
        res.status(400).json({
          success: false,
          message: 'Price is required for limit orders',
        })
        return
      }

      const order = await orderService.placeOrder({
        userId,
        stockId,
        orderType,
        executionType,
        quantity: parseFloat(quantity),
        price: price ? parseFloat(price) : undefined,
      })

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: order,
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to place order',
      })
    }
  }

  async getUserOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
      }

      const orders = await orderService.getUserOrders(userId)
      res.status(200).json({
        success: true,
        message: 'Orders fetched successfully',
        data: orders,
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch orders',
      })
    }
  }

  async cancelOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
      }

      const orderId = req.params.orderId as string
      const order = await orderService.cancelOrder(orderId, userId)

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: order,
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to cancel order',
      })
    }
  }
}