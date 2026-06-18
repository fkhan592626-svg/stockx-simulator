import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { stockAPI, watchlistAPI, orderAPI } from '../services/api'
import type { Stock } from '../types'
import { TrendingUp, TrendingDown, Star, ArrowLeft } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const StockDetail = () => {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const [stock, setStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(true)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [orderForm, setOrderForm] = useState({
    orderType: 'BUY',
    executionType: 'MARKET',
    quantity: '',
    price: '',
  })
  const [orderError, setOrderError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState('')

  useEffect(() => {
    if (!symbol) return
    stockAPI.getBySymbol(symbol)
      .then((res) => setStock(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))

    watchlistAPI.getWatchlist().then((res) => {
      const found = res.data.data.find((w: any) => w.stock.symbol === symbol)
      setInWatchlist(!!found)
    })
  }, [symbol])

  const handleWatchlist = async () => {
    if (!stock) return
    try {
      if (inWatchlist) {
        await watchlistAPI.removeFromWatchlist(stock.id)
        setInWatchlist(false)
      } else {
        await watchlistAPI.addToWatchlist(stock.id)
        setInWatchlist(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stock) return
    setOrderError('')
    setOrderSuccess('')
    try {
      await orderAPI.placeOrder({
        stockId: stock.id,
        orderType: orderForm.orderType,
        executionType: orderForm.executionType,
        quantity: parseFloat(orderForm.quantity),
        price: orderForm.price ? parseFloat(orderForm.price) : undefined,
      })
      setOrderSuccess('Order placed successfully!')
      setOrderForm({ orderType: 'BUY', executionType: 'MARKET', quantity: '', price: '' })
    } catch (err: any) {
      setOrderError(err.response?.data?.message || 'Failed to place order')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-purple-400 text-xl">Loading...</div></div>
  if (!stock) return <div className="text-center text-gray-400">Stock not found</div>

  const chartData = stock.priceHistory?.map((ph) => ({
    date: new Date(ph.timestamp).toLocaleDateString(),
    price: ph.close,
  })) || []

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{stock.symbol}</h1>
              <span className="text-gray-400 bg-gray-800 px-3 py-1 rounded-full text-sm">{stock.sector}</span>
            </div>
            <p className="text-gray-400 mt-1">{stock.name}</p>
          </div>
          <button
            onClick={handleWatchlist}
            className={`p-2 rounded-lg transition-colors ${inWatchlist ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-yellow-400'}`}
          >
            <Star className="w-6 h-6" fill={inWatchlist ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <p className="text-4xl font-bold text-white">${stock.currentPrice.toFixed(2)}</p>
          <div className={`flex items-center gap-1 ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stock.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span className="text-lg font-medium">
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Previous Close', value: `$${stock.previousClose.toFixed(2)}` },
            { label: '52W High', value: `$${stock.high52Week.toFixed(2)}` },
            { label: '52W Low', value: `$${stock.low52Week.toFixed(2)}` },
            { label: 'Market Cap', value: `$${(stock.marketCap / 1e9).toFixed(2)}B` },
          ].map((item) => (
            <div key={item.label} className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">{item.label}</p>
              <p className="text-white font-medium mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Price History (90 days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} tickLine={false} interval={14} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: '#8b5cf6' }}
            />
            <Line type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Place Order</h2>
        {orderError && <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">{orderError}</div>}
        {orderSuccess && <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-4">{orderSuccess}</div>}
        <form onSubmit={handleOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Order Type</label>
            <select
              value={orderForm.orderType}
              onChange={(e) => setOrderForm({ ...orderForm, orderType: e.target.value })}
              className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Execution Type</label>
            <select
              value={orderForm.executionType}
              onChange={(e) => setOrderForm({ ...orderForm, executionType: e.target.value })}
              className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="MARKET">MARKET</option>
              <option value="LIMIT">LIMIT</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Quantity</label>
            <input
              type="number"
              value={orderForm.quantity}
              onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
              className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              placeholder="10"
              min="1"
              required
            />
          </div>
          {orderForm.executionType === 'LIMIT' && (
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Limit Price</label>
              <input
                type="number"
                value={orderForm.price}
                onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                placeholder="150.00"
                step="0.01"
                required
              />
            </div>
          )}
          <div className="md:col-span-2">
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${orderForm.orderType === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
            >
              {orderForm.orderType} {stock.symbol}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockDetail