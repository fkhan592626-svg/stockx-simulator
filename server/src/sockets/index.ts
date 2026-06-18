/// <reference types="node" />
import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import jwt from 'jsonwebtoken'
import WebSocket from 'ws'
import { prisma } from '../prisma/client'
import { JwtPayload } from '../types'

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication error'))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
      socket.data.user = decoded
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.data.user?.username}`)
    socket.join(`user:${socket.data.user?.userId}`)

    socket.on('subscribe:stocks', () => {
      socket.join('stocks')
      console.log(`📈 ${socket.data.user?.username} subscribed to stocks`)
    })

    socket.on('unsubscribe:stocks', () => socket.leave('stocks'))
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.data.user?.username}`)
    })
  })

  // Finnhub WebSocket
  const finnhubWs = new WebSocket(
    `wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`
  )

  finnhubWs.on('open', async () => {
    console.log('📡 Connected to Finnhub')
    const stocks = await prisma.stock.findMany({ select: { symbol: true } })
    stocks.forEach((stock) => {
      finnhubWs.send(JSON.stringify({ type: 'subscribe', symbol: stock.symbol }))
    })
  })

  finnhubWs.on('message', async (data: WebSocket.Data) => {
    try {
      const parsed = JSON.parse(data.toString())
      if (parsed.type !== 'trade') return

      for (const trade of parsed.data) {
        const symbol = trade.s
        const price = trade.p

        const stock = await prisma.stock.findUnique({ where: { symbol } })
        if (!stock) continue

        const change = parseFloat((price - stock.previousClose).toFixed(2))
        const changePercent = parseFloat(
          (((price - stock.previousClose) / stock.previousClose) * 100).toFixed(2)
        )

        await prisma.stock.update({
          where: { symbol },
          data: { currentPrice: price, change, changePercent },
        })

        io.to('stocks').emit('stocks:update', [{
          id: stock.id,
          symbol,
          currentPrice: price,
          change,
          changePercent,
        }])
      }
    } catch (err) {
      console.error('Finnhub message error:', err)
    }
  })

  finnhubWs.on('error', (err) => {
    console.error('Finnhub WebSocket error:', err.message)
  })

  finnhubWs.on('close', () => {
    console.log('📡 Finnhub connection closed')
  })

  // Fallback simulation every 5 seconds
  setInterval(async () => {
    try {
      const stocks = await prisma.stock.findMany()
      const updates = stocks.map((stock) => {
        const changePercent = (Math.random() - 0.48) * 2
        const priceChange = stock.currentPrice * (changePercent / 100)
        const newPrice = Math.max(stock.currentPrice + priceChange, 0.01)
        return {
          id: stock.id,
          symbol: stock.symbol,
          currentPrice: parseFloat(newPrice.toFixed(2)),
          change: parseFloat((newPrice - stock.previousClose).toFixed(2)),
          changePercent: parseFloat(
            (((newPrice - stock.previousClose) / stock.previousClose) * 100).toFixed(2)
          ),
        }
      })

      for (const update of updates) {
        await prisma.stock.update({
          where: { id: update.id },
          data: {
            currentPrice: update.currentPrice,
            change: update.change,
            changePercent: update.changePercent,
          },
        })
      }

      io.to('stocks').emit('stocks:update', updates)
    } catch (error) {
      console.error('Simulation error:', error)
    }
  }, 5000)

  return io
}