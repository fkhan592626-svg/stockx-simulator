/// <reference types="node" />
import { prisma } from '../prisma/client'

export class PortfolioService {
  async getPortfolio(userId: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        holdings: {
          include: {
            stock: true,
          },
        },
      },
    })

    if (!portfolio) throw new Error('Portfolio not found')

    const updatedHoldings = portfolio.holdings.map((holding) => {
      const currentValue = holding.quantity * holding.stock.currentPrice
      const pnl = currentValue - holding.totalCost
      const pnlPercent = (pnl / holding.totalCost) * 100

      return {
        ...holding,
        currentValue,
        pnl,
        pnlPercent,
      }
    })

    const totalValue = updatedHoldings.reduce(
      (sum, h) => sum + h.currentValue,
      0
    )
    const totalCost = updatedHoldings.reduce((sum, h) => sum + h.totalCost, 0)
    const totalPnL = totalValue - totalCost

    return {
      ...portfolio,
      holdings: updatedHoldings,
      totalValue,
      totalCost,
      totalPnL,
    }
  }

  async getHoldings(userId: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        holdings: {
          include: { stock: true },
        },
      },
    })

    if (!portfolio) throw new Error('Portfolio not found')
    return portfolio.holdings
  }

  async getPortfolioSummary(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cashBalance: true },
    })

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        holdings: {
          include: { stock: true },
        },
      },
    })

    if (!portfolio || !user) throw new Error('Portfolio not found')

    const holdings = portfolio.holdings.map((h) => ({
      ...h,
      currentValue: h.quantity * h.stock.currentPrice,
      pnl: h.quantity * h.stock.currentPrice - h.totalCost,
      pnlPercent:
        ((h.quantity * h.stock.currentPrice - h.totalCost) / h.totalCost) *
        100,
    }))

    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
    const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0)
    const totalPnL = totalValue - totalCost
    const totalPortfolioValue = totalValue + user.cashBalance

    const bestPerforming = [...holdings].sort((a, b) => b.pnlPercent - a.pnlPercent).slice(0, 3)
    const worstPerforming = [...holdings].sort((a, b) => a.pnlPercent - b.pnlPercent).slice(0, 3)

    return {
      cashBalance: user.cashBalance,
      totalValue,
      totalCost,
      totalPnL,
      totalPortfolioValue,
      holdingsCount: holdings.length,
      bestPerforming,
      worstPerforming,
      holdings,
    }
  }

  async getTransactionHistory(userId: string) {
    return prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: { stock: true },
      orderBy: { timestamp: 'desc' },
      take: 50,
    })
  }
}