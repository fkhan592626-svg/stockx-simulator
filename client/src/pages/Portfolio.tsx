import React, { useEffect, useState } from 'react'
import { portfolioAPI } from '../services/api'
import type { PortfolioSummary } from '../types'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#f97316']

const Portfolio = () => {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    portfolioAPI.getSummary()
      .then((res) => setSummary(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-purple-400 text-xl">Loading...</div></div>

  const pieData = summary?.holdings.map((h) => ({
    name: h.stock.symbol,
    value: parseFloat(h.currentValue.toFixed(2)),
  })) || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Portfolio</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Total Value</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">
            ${summary?.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Total Cost</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            ${summary?.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Total P&L</p>
          <p className={`text-2xl font-bold mt-1 ${(summary?.totalPnL ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(summary?.totalPnL ?? 0) >= 0 ? '+' : ''}${summary?.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Portfolio Allocation</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${value}`, 'Value']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No holdings yet</p>
          )}
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Holdings</h2>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {summary?.holdings.map((holding) => (
              <div key={holding.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{holding.stock.symbol}</p>
                  <p className="text-gray-400 text-xs">{holding.quantity} shares @ ${holding.averageBuyPrice.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-white">${holding.currentValue.toFixed(2)}</p>
                  <div className={`flex items-center gap-1 text-xs ${holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {holding.pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {holding.pnl >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
            {(!summary?.holdings || summary.holdings.length === 0) && (
              <p className="text-gray-400">No holdings yet. Start trading!</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">🏆 Best Performing</h2>
          <div className="space-y-3">
            {summary?.bestPerforming.map((h) => (
              <div key={h.id} className="flex items-center justify-between">
                <p className="text-white">{h.stock.symbol}</p>
                <p className="text-green-400">+{h.pnlPercent.toFixed(2)}%</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">📉 Worst Performing</h2>
          <div className="space-y-3">
            {summary?.worstPerforming.map((h) => (
              <div key={h.id} className="flex items-center justify-between">
                <p className="text-white">{h.stock.symbol}</p>
                <p className="text-red-400">{h.pnlPercent.toFixed(2)}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Portfolio