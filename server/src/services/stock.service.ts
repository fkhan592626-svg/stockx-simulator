/// <reference types="node" />
import { prisma } from '../prisma/client'

export class StockService {
  async getAllStocks() {
  try {
    return await prisma.stock.findMany({
      orderBy: { symbol: 'asc' },
    })
  } catch (error) {
    console.error('getAllStocks error:', error)
    throw error
  }
}

  async getStockBySymbol(symbol: string) {
    const stock = await prisma.stock.findUnique({
      where: { symbol: symbol.toUpperCase() },
      include: {
        priceHistory: {
          orderBy: { timestamp: 'asc' },
          take: 90,
        },
      },
    })
    if (!stock) throw new Error('Stock not found')
    return stock
  }

  async getStockById(id: string) {
    const stock = await prisma.stock.findUnique({
      where: { id },
      include: {
        priceHistory: {
          orderBy: { timestamp: 'asc' },
          take: 90,
        },
      },
    })
    if (!stock) throw new Error('Stock not found')
    return stock
  }

  async searchStocks(query: string) {
    return prisma.stock.findMany({
      where: {
        OR: [
          { symbol: { contains: query.toUpperCase(), mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    })
  }

  async getStocksBysector(sector: string) {
    return prisma.stock.findMany({
      where: { sector: { equals: sector, mode: 'insensitive' } },
      orderBy: { symbol: 'asc' },
    })
  }

  async updateStockPrice(
    symbol: string,
    price: number,
    change: number,
    changePercent: number
  ) {
    return prisma.stock.update({
      where: { symbol },
      data: {
        currentPrice: price,
        change,
        changePercent,
        updatedAt: new Date(),
      },
    })
  }
}