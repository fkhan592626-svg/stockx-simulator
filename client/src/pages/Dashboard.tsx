import  { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { portfolioAPI, stockAPI } from '../services/api'
import type { PortfolioSummary, Stock } from '../types'
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Activity } from 'lucide-react'


const Dashboard = () => {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, stocksRes] = await Promise.all([
          portfolioAPI.getSummary(),
          stockAPI.getAll(),
        ])
        setSummary(summaryRes.data.data)
        console.log('Stocks:', stocksRes.data.data)
        setStocks(stocksRes.data.data.slice(0, 10))
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!socket) return
socket.on('stocks:update', (updates: any[]) => {
  setStocks((prev) => {
    if (!prev.length) return prev
    return prev.map((stock) => {
      const update = updates.find((u) => u.symbol === stock.symbol)
      return update ? { ...stock, currentPrice: update.currentPrice, change: update.change, changePercent: update.changePercent } : stock
    })
  })
})
    return () => { socket.off('stocks:update') }
  }, [socket])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400 text-xl">Loading...</div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Portfolio Value',
      value: `$${summary?.totalValue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
      icon: Briefcase,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      title: 'Cash Balance',
      value: `$${user?.cashBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
      icon: DollarSign,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      title: 'Total P&L',
      value: `$${summary?.totalPnL?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
      icon: (summary?.totalPnL ?? 0)>= 0 ? TrendingUp : TrendingDown,
      color: (summary?.totalPnL ?? 0) >= 0 ? 'text-green-400' : 'text-red-400',
      bg: (summary?.totalPnL ?? 0) >= 0 ? 'bg-green-400/10' : 'bg-red-400/10',
    },
    {
      title: 'Total Assets',
      value: `$${summary?.totalPortfolioValue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-400">Here's your trading overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">{card.title}</p>
                <div className={`${card.bg} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Top Holdings</h2>
          {summary?.holdings && summary.holdings.length > 0 ? (
            <div className="space-y-3">
              {summary.holdings.slice(0, 5).map((holding) => (
                <div key={holding.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{holding.stock.symbol}</p>
                    <p className="text-gray-400 text-sm">{holding.quantity} shares</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">${holding.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p className={holding.pnl >= 0 ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                      {holding.pnl >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No holdings yet. Start trading!</p>
          )}
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Live Market</h2>
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
              Live
            </span>
          </div>
          <div className="space-y-3">
            {stocks.map((stock) => (
              <Link
                key={stock.id}
                to={`/stocks/${stock.symbol}`}
                className="flex items-center justify-between hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="text-white font-medium">{stock.symbol}</p>
                  <p className="text-gray-400 text-xs">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-white">${stock.currentPrice.toFixed(2)}</p>
                  <p className={stock.change >= 0 ? 'text-green-400 text-xs' : 'text-red-400 text-xs'}>
                    {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard