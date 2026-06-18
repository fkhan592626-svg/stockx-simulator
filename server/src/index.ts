/// <reference types="node" />
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'

dotenv.config() ;
(BigInt.prototype as any).toJSON = function() { return this.toString()}

import authRoutes from './routes/auth.routes'
import stockRoutes from './routes/stock.routes'
import portfolioRoutes from './routes/portfolio.routes'
import orderRoutes from './routes/order.routes'
import watchlistRoutes from './routes/watchlist.routes'
import { initializeSocket } from './sockets'

const app = express()
const httpServer = createServer(app)

const io = initializeSocket(httpServer)

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req: any, res: any, next: any) => {
  req.io = io
  next()
})

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'StockX API is running!' })
})

app.use('/api/auth', authRoutes)
app.use('/api/stocks', stockRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/watchlist', watchlistRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 StockX API ready!`)
  console.log(`🔌 Socket.io ready!`)
})

export default app