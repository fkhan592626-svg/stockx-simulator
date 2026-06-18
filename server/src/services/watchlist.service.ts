/// <reference types="node" />
import { prisma } from '../prisma/client'

export class WatchlistService {
  async getWatchlist(userId: string) {
    return prisma.watchlist.findMany({
      where: { userId },
      include: { stock: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async addToWatchlist(userId: string, stockId: string) {
    const existing = await prisma.watchlist.findUnique({
      where: { userId_stockId: { userId, stockId } },
    })

    if (existing) throw new Error('Stock already in watchlist')

    return prisma.watchlist.create({
      data: { userId, stockId },
      include: { stock: true },
    })
  }

  async removeFromWatchlist(userId: string, stockId: string) {
    const existing = await prisma.watchlist.findUnique({
      where: { userId_stockId: { userId, stockId } },
    })

    if (!existing) throw new Error('Stock not in watchlist')

    return prisma.watchlist.delete({
      where: { userId_stockId: { userId, stockId } },
    })
  }

  async isInWatchlist(userId: string, stockId: string) {
    const existing = await prisma.watchlist.findUnique({
      where: { userId_stockId: { userId, stockId } },
    })
    return !!existing
  }
}