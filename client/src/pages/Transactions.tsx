import  { useEffect, useState } from 'react'
import { portfolioAPI } from '../services/api'
import type { Transaction } from '../types'

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    portfolioAPI.getTransactions()
      .then((res) => setTransactions(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-purple-400 text-xl">Loading...</div></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Transactions</h1>

      <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm px-6 py-4">Stock</th>
              <th className="text-left text-gray-400 text-sm px-6 py-4">Type</th>
              <th className="text-left text-gray-400 text-sm px-6 py-4">Quantity</th>
              <th className="text-left text-gray-400 text-sm px-6 py-4">Price</th>
              <th className="text-left text-gray-400 text-sm px-6 py-4">Total</th>
              <th className="text-left text-gray-400 text-sm px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                <td className="px-6 py-4">
                  <p className="text-white font-medium">{tx.stock.symbol}</p>
                  <p className="text-gray-400 text-xs">{tx.stock.name}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${tx.sellerId ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10'}`}>
                    {tx.sellerId ? 'SELL' : 'BUY'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm">{tx.quantity}</td>
                <td className="px-6 py-4 text-gray-300 text-sm">${tx.executedPrice.toFixed(2)}</td>
                <td className="px-6 py-4 text-white font-medium">${tx.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {new Date(tx.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Transactions