import  { useEffect, useState } from 'react'
import { portfolioAPI } from '../services/api'
import type { PortfolioSummary, Transaction } from '../types'
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react'
import {
   XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#f97316']

const Analytics = () => {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      portfolioAPI.getSummary(),
      portfolioAPI.getTransactions(),
    ])
      .then(([summaryRes, txRes]) => {
        setSummary(summaryRes.data.data)
        setTransactions(txRes.data.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-purple-400 text-xl">Loading...</div></div>

  const pieData = summary?.holdings.map((h) => ({
    name: h.stock.symbol,
    value: parseFloat(h.currentValue.toFixed(2)),
  })) || []

  const pnlData = summary?.holdings.map((h) => ({
    symbol: h.stock.symbol,
    pnl: parseFloat(h.pnl.toFixed(2)),
    pnlPercent: parseFloat(h.pnlPercent.toFixed(2)),
  })) || []

  const txByDay = transactions.reduce((acc: any, tx) => {
    const date = new Date(tx.timestamp).toLocaleDateString()
    if (!acc[date]) acc[date] = { date, volume: 0, count: 0 }
    acc[date].volume += tx.totalAmount
    acc[date].count += 1
    return acc
  }, {})

  const volumeData = Object.values(txByDay).slice(-14)

  const statCards = [
    {
      title: 'Total Invested',
      value: `$${summary?.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
      icon: DollarSign,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      title: 'Current Value',
      value: `$${summary?.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
      icon: BarChart2,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      title: 'Total P&L',
      value: `$${summary?.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
      icon: (summary?.totalPnL ?? 0) >= 0 ? TrendingUp : TrendingDown,
      color: (summary?.totalPnL ?? 0) >= 0 ? 'text-green-400' : 'text-red-400',
      bg: (summary?.totalPnL ?? 0) >= 0 ? 'bg-green-400/10' : 'bg-red-400/10',
    },
    {
      title: 'Total Transactions',
      value: transactions.length.toString(),
      icon: BarChart2,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

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
          <h2 className="text-lg font-semibold text-white mb-4">Portfolio Allocation</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${value}`, 'Value']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No holdings yet</p>
          )}
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">P&L by Stock</h2>
          {pnlData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pnlData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="symbol" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Bar dataKey="pnl" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {pnlData.map((entry, index) => (
                    <Cell key={index} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No holdings yet</p>
          )}
        </div>
      </div>

      <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Trading Volume (Last 14 days)</h2>
        {volumeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }}
                formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Volume']}
              />
              <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400">No transaction data yet</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">🏆 Best Performing</h2>
          <div className="space-y-3">
            {summary?.bestPerforming.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{h.stock.symbol}</p>
                  <p className="text-gray-400 text-xs">{h.quantity} shares</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">+{h.pnlPercent.toFixed(2)}%</p>
                  <p className="text-gray-400 text-xs">+${h.pnl.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {(!summary?.bestPerforming || summary.bestPerforming.length === 0) && (
              <p className="text-gray-400">No data yet</p>
            )}
          </div>
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">📉 Worst Performing</h2>
          <div className="space-y-3">
            {summary?.worstPerforming.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{h.stock.symbol}</p>
                  <p className="text-gray-400 text-xs">{h.quantity} shares</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-medium">{h.pnlPercent.toFixed(2)}%</p>
                  <p className="text-gray-400 text-xs">${h.pnl.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {(!summary?.worstPerforming || summary.worstPerforming.length === 0) && (
              <p className="text-gray-400">No data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics