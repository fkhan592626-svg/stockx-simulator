import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { watchlistAPI } from '../services/api'
import type { Watchlist } from '../types'
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react'

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState<Watchlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      const res = await watchlistAPI.getWatchlist()
      setWatchlist(res.data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (stockId: string) => {
    try {
      await watchlistAPI.removeFromWatchlist(stockId)
      fetchWatchlist()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-purple-400 text-xl">Loading...</div></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Watchlist</h1>

      {watchlist.length === 0 ? (
        <div className="bg-[#1a1a2e] rounded-xl p-12 border border-gray-800 text-center">
          <p className="text-gray-400 text-lg">Your watchlist is empty.</p>
          <p className="text-gray-500 text-sm mt-2">Add stocks from the market to track them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => (
            <div key={item.id} className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <Link to={`/stocks/${item.stock.symbol}`}>
                  <h3 className="text-white font-bold text-lg hover:text-purple-400 transition-colors">
                    {item.stock.symbol}
                  </h3>
                  <p className="text-gray-400 text-sm">{item.stock.name}</p>
                </Link>
                <button
                  onClick={() => handleRemove(item.stockId)}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-white">
                  ${item.stock.currentPrice.toFixed(2)}
                </p>
                <div className={`flex items-center gap-1 ${item.stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.stock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-medium">
                    {item.stock.change >= 0 ? '+' : ''}{item.stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Sector</p>
                  <p className="text-gray-300">{item.stock.sector}</p>
                </div>
                <div>
                  <p className="text-gray-500">Prev Close</p>
                  <p className="text-gray-300">${item.stock.previousClose.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WatchlistPage