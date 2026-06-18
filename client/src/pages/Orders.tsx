import React, { useEffect, useState } from 'react'
import { orderAPI, stockAPI } from '../services/api'
import type { Order, Stock } from '../types'
import { X, Plus } from 'lucide-react'

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    stockId: '',
    orderType: 'BUY',
    executionType: 'MARKET',
    quantity: '',
    price: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordersRes, stocksRes] = await Promise.all([
        orderAPI.getOrders(),
        stockAPI.getAll(),
      ])
      setOrders(ordersRes.data.data)
      setStocks(stocksRes.data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await orderAPI.placeOrder({
        ...formData,
        quantity: parseFloat(formData.quantity),
        price: formData.price ? parseFloat(formData.price) : undefined,
      })
      setSuccess('Order placed successfully!')
      setShowForm(false)
      setFormData({ stockId: '', orderType: 'BUY', executionType: 'MARKET', quantity: '', price: '' })
      fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order')
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderAPI.cancelOrder(orderId)
      fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel order')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILLED': return 'text-green-400 bg-green-400/10'
      case 'PENDING': return 'text-yellow-400 bg-yellow-400/10'
      case 'CANCELLED': return 'text-red-400 bg-red-400/10'
      case 'PARTIALLY_FILLED': return 'text-blue-400 bg-blue-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-purple-400 text-xl">Loading...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Place Order
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">{success}</div>}

      {showForm && (
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Place New Order</h2>
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Stock</label>
              <select
                value={formData.stockId}
                onChange={(e) => setFormData({ ...formData, stockId: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                required
              >
                <option value="">Select Stock</option>
                {stocks.map((stock) => (
                  <option key={stock.id} value={stock.id}>
                    {stock.symbol} - ${stock.currentPrice.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Order Type</label>
              <select
                value={formData.orderType}
                onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Execution Type</label>
              <select
                value={formData.executionType}
                onChange={(e) => setFormData({ ...formData, executionType: e.target.value })}
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
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                placeholder="10"
                min="1"
                required
              />
            </div>

            {formData.executionType === 'LIMIT' && (
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Limit Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="150.00"
                  step="0.01"
                  required
                />
              </div>
            )}

            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Place Order
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm px-6 py-4">Stock</th>
              <th className="text-left text-gray-400 text-sm px-6 py-4">Type</th>
              <th className="text-left text-gray-400 text-sm px-6 py-4">Execution</th>
              <th className="text-left text-gray-400 text-sm px-6 py-4">Quantity</th>
              <th className="text-left text-gray-400 text-sm px-6 py-4">Price</th>
              <th className="text-left text-gray-400 text-sm px-6 py-4">Status</th>
              <th className="text-left text-gray-400 text-sm px-6 py-4">Date</th>
              <th className="text-left text-gray-400 text-sm px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                <td className="px-6 py-4">
                  <p className="text-white font-medium">{order.stock.symbol}</p>
                  <p className="text-gray-400 text-xs">{order.stock.name}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${order.orderType === 'BUY' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    {order.orderType}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm">{order.executionType}</td>
                <td className="px-6 py-4 text-gray-300 text-sm">{order.quantity}</td>
                <td className="px-6 py-4 text-gray-300 text-sm">${order.price?.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                  No orders yet. Place your first order!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Orders