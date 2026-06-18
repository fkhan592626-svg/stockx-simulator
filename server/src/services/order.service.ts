/// <reference types="node" />
import { prisma } from '../prisma/client'
import { OrderType, ExecutionType, OrderStatus } from '@prisma/client'

export class OrderService {
  async placeOrder(data: {
    userId: string
    stockId: string
    orderType: OrderType
    executionType: ExecutionType
    quantity: number
    price?: number
  }) {
    const { userId, stockId, orderType, executionType, quantity, price } = data

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const stock = await prisma.stock.findUnique({ where: { id: stockId } })
    if (!stock) throw new Error('Stock not found')

    const executionPrice =
      executionType === ExecutionType.MARKET ? stock.currentPrice : price

    if (!executionPrice) throw new Error('Price is required for limit orders')

    if (orderType === OrderType.BUY) {
      const totalCost = executionPrice * quantity
      if (user.cashBalance < totalCost) {
        throw new Error(
          `Insufficient funds. Required: $${totalCost.toFixed(2)}, Available: $${user.cashBalance.toFixed(2)}`
        )
      }
    }

    if (orderType === OrderType.SELL) {
      const portfolio = await prisma.portfolio.findUnique({
        where: { userId },
        include: { holdings: { where: { stockId } } },
      })

      const holding = portfolio?.holdings[0]
      if (!holding || holding.quantity < quantity) {
        throw new Error(
          `Insufficient shares. Required: ${quantity}, Available: ${holding?.quantity || 0}`
        )
      }
    }

    const order = await prisma.order.create({
      data: {
        userId,
        stockId,
        orderType,
        executionType,
        quantity,
        remainingQuantity: quantity,
        price: executionPrice,
        status: OrderStatus.PENDING,
      },
    })

    const matchedOrder = await this.matchOrder(order.id)
    return matchedOrder
  }

  async matchOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { stock: true, user: true },
    })

    if (!order) throw new Error('Order not found')

    if (order.executionType === ExecutionType.MARKET) {
      await this.executeMarketOrder(order)
    } else {
      await this.executeLimitOrder(order)
    }

    return prisma.order.findUnique({
      where: { id: orderId },
      include: { stock: true },
    })
  }

  private async executeMarketOrder(order: any) {
    const stock = order.stock
    const executedPrice = stock.currentPrice
    const quantity = order.remainingQuantity

    await this.executeOrder(order, executedPrice, quantity)
  }

  private async executeLimitOrder(order: any) {
    const stock = order.stock

    if (order.orderType === OrderType.BUY) {
      if (stock.currentPrice <= (order.price || 0)) {
        await this.executeOrder(order, order.price, order.remainingQuantity)
      }
    } else {
      if (stock.currentPrice >= (order.price || 0)) {
        await this.executeOrder(order, order.price, order.remainingQuantity)
      }
    }
  }

  private async executeOrder(order: any, executedPrice: number, quantity: number) {
    const totalAmount = executedPrice * quantity

    if (order.orderType === OrderType.BUY) {
      await prisma.user.update({
        where: { id: order.userId },
        data: { cashBalance: { decrement: totalAmount } },
      })

      await this.updateHoldingBuy(order.userId, order.stockId, quantity, executedPrice)
    } else {
      await prisma.user.update({
        where: { id: order.userId },
        data: { cashBalance: { increment: totalAmount } },
      })

      await this.updateHoldingSell(order.userId, order.stockId, quantity)
    }

    await prisma.transaction.create({
      data: {
        buyerId: order.orderType === OrderType.BUY ? order.userId : 'system',
        sellerId: order.orderType === OrderType.SELL ? order.userId : null,
        stockId: order.stockId,
        quantity,
        executedPrice,
        totalAmount,
      },
    })

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.FILLED,
        remainingQuantity: 0,
      },
    })

    await this.updatePortfolio(order.userId)
  }

  private async updateHoldingBuy(
    userId: string,
    stockId: string,
    quantity: number,
    price: number
  ) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: { holdings: { where: { stockId } } },
    })

    if (!portfolio) throw new Error('Portfolio not found')

    const existingHolding = portfolio.holdings[0]

    if (existingHolding) {
      const newQuantity = existingHolding.quantity + quantity
      const newTotalCost = existingHolding.totalCost + quantity * price
      const newAvgPrice = newTotalCost / newQuantity

      await prisma.holding.update({
        where: { id: existingHolding.id },
        data: {
          quantity: newQuantity,
          averageBuyPrice: newAvgPrice,
          totalCost: newTotalCost,
          currentValue: newQuantity * price,
        },
      })
    } else {
      await prisma.holding.create({
        data: {
          portfolioId: portfolio.id,
          stockId,
          quantity,
          averageBuyPrice: price,
          totalCost: quantity * price,
          currentValue: quantity * price,
        },
      })
    }
  }

  private async updateHoldingSell(
    userId: string,
    stockId: string,
    quantity: number
  ) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: { holdings: { where: { stockId } } },
    })

    if (!portfolio) throw new Error('Portfolio not found')

    const holding = portfolio.holdings[0]
    if (!holding) throw new Error('Holding not found')

    const newQuantity = holding.quantity - quantity

    if (newQuantity <= 0) {
      await prisma.holding.delete({ where: { id: holding.id } })
    } else {
      const stock = await prisma.stock.findUnique({ where: { id: stockId } })
      await prisma.holding.update({
        where: { id: holding.id },
        data: {
          quantity: newQuantity,
          currentValue: newQuantity * (stock?.currentPrice || 0),
          totalCost: newQuantity * holding.averageBuyPrice,
        },
      })
    }
  }

  private async updatePortfolio(userId: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: { holdings: { include: { stock: true } } },
    })

    if (!portfolio) return

    const totalValue = portfolio.holdings.reduce(
      (sum, h) => sum + h.quantity * h.stock.currentPrice,
      0
    )
    const totalCost = portfolio.holdings.reduce(
      (sum, h) => sum + h.totalCost,
      0
    )

    await prisma.portfolio.update({
      where: { userId },
      data: {
        totalValue,
        totalCost,
        totalPnL: totalValue - totalCost,
      },
    })
  }

  async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { stock: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } })

    if (!order) throw new Error('Order not found')
    if (order.userId !== userId) throw new Error('Unauthorized')
    if (order.status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be cancelled')
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    })
  }
}