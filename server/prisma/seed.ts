/// <reference types="node" />
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const stocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', currentPrice: 189.5, previousClose: 187.2, marketCap: 2950000000000, high52Week: 199.6, low52Week: 124.2 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', currentPrice: 415.3, previousClose: 412.1, marketCap: 3080000000000, high52Week: 430.8, low52Week: 309.4 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', currentPrice: 175.8, previousClose: 173.4, marketCap: 2180000000000, high52Week: 193.3, low52Week: 120.2 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', currentPrice: 198.4, previousClose: 195.6, marketCap: 2070000000000, high52Week: 201.2, low52Week: 118.4 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', currentPrice: 875.4, previousClose: 859.2, marketCap: 2160000000000, high52Week: 974.0, low52Week: 392.3 },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', currentPrice: 527.8, previousClose: 521.3, marketCap: 1350000000000, high52Week: 544.3, low52Week: 279.4 },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical', currentPrice: 245.6, previousClose: 238.4, marketCap: 782000000000, high52Week: 278.9, low52Week: 138.8 },
  { symbol: 'BRK', name: 'Berkshire Hathaway Inc.', sector: 'Financials', currentPrice: 398.2, previousClose: 395.1, marketCap: 869000000000, high52Week: 412.3, low52Week: 318.2 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials', currentPrice: 212.4, previousClose: 209.8, marketCap: 612000000000, high52Week: 225.5, low52Week: 135.2 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', currentPrice: 152.3, previousClose: 151.1, marketCap: 367000000000, high52Week: 168.0, low52Week: 143.2 },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financials', currentPrice: 278.9, previousClose: 275.4, marketCap: 572000000000, high52Week: 290.9, low52Week: 220.2 },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive', currentPrice: 165.4, previousClose: 164.2, marketCap: 392000000000, high52Week: 173.0, low52Week: 138.8 },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare', currentPrice: 524.8, previousClose: 519.3, marketCap: 484000000000, high52Week: 558.8, low52Week: 430.0 },
  { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Cyclical', currentPrice: 378.2, previousClose: 374.5, marketCap: 375000000000, high52Week: 396.5, low52Week: 264.5 },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financials', currentPrice: 468.3, previousClose: 463.2, marketCap: 438000000000, high52Week: 492.8, low52Week: 353.4 },
  { symbol: 'DIS', name: 'Walt Disney Co.', sector: 'Communication Services', currentPrice: 112.4, previousClose: 110.8, marketCap: 205000000000, high52Week: 123.7, low52Week: 78.7 },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services', currentPrice: 628.4, previousClose: 619.2, marketCap: 271000000000, high52Week: 700.0, low52Week: 344.7 },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', currentPrice: 524.3, previousClose: 518.7, marketCap: 232000000000, high52Week: 638.2, low52Week: 430.0 },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', currentPrice: 298.4, previousClose: 294.2, marketCap: 289000000000, high52Week: 318.7, low52Week: 193.6 },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', sector: 'Financials', currentPrice: 68.4, previousClose: 67.2, marketCap: 73000000000, high52Week: 93.5, low52Week: 50.2 },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology', currentPrice: 42.8, previousClose: 42.1, marketCap: 180000000000, high52Week: 51.3, low52Week: 29.7 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', currentPrice: 178.4, previousClose: 174.3, marketCap: 288000000000, high52Week: 227.3, low52Week: 93.1 },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', sector: 'Technology', currentPrice: 168.9, previousClose: 165.4, marketCap: 191000000000, high52Week: 230.6, low52Week: 103.0 },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', currentPrice: 128.4, previousClose: 126.8, marketCap: 352000000000, high52Week: 165.6, low52Week: 89.4 },
  { symbol: 'IBM', name: 'IBM Corporation', sector: 'Technology', currentPrice: 168.3, previousClose: 166.4, marketCap: 153000000000, high52Week: 196.9, low52Week: 120.6 },
  { symbol: 'GS', name: 'Goldman Sachs Group', sector: 'Financials', currentPrice: 428.5, previousClose: 423.2, marketCap: 139000000000, high52Week: 450.0, low52Week: 277.8 },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financials', currentPrice: 38.4, previousClose: 37.9, marketCap: 303000000000, high52Week: 44.4, low52Week: 24.9 },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive', currentPrice: 68.2, previousClose: 67.5, marketCap: 548000000000, high52Week: 74.4, low52Week: 47.9 },
  { symbol: 'KO', name: 'Coca-Cola Co.', sector: 'Consumer Defensive', currentPrice: 62.4, previousClose: 61.8, marketCap: 269000000000, high52Week: 66.9, low52Week: 52.4 },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Defensive', currentPrice: 174.3, previousClose: 172.8, marketCap: 239000000000, high52Week: 196.9, low52Week: 155.8 },
  { symbol: 'MCD', name: "McDonald's Corporation", sector: 'Consumer Cyclical', currentPrice: 298.4, previousClose: 295.2, marketCap: 217000000000, high52Week: 317.9, low52Week: 245.7 },
  { symbol: 'NKE', name: 'Nike Inc.', sector: 'Consumer Cyclical', currentPrice: 98.4, previousClose: 96.8, marketCap: 151000000000, high52Week: 128.6, low52Week: 86.7 },
  { symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer Cyclical', currentPrice: 92.4, previousClose: 91.2, marketCap: 104000000000, high52Week: 115.5, low52Week: 71.8 },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', currentPrice: 112.8, previousClose: 111.4, marketCap: 451000000000, high52Week: 123.7, low52Week: 88.0 },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', currentPrice: 154.3, previousClose: 152.8, marketCap: 292000000000, high52Week: 189.7, low52Week: 132.7 },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', currentPrice: 28.4, previousClose: 28.1, marketCap: 161000000000, high52Week: 42.2, low52Week: 25.2 },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', currentPrice: 168.4, previousClose: 166.8, marketCap: 297000000000, high52Week: 175.4, low52Week: 128.7 },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', sector: 'Healthcare', currentPrice: 124.8, previousClose: 123.4, marketCap: 316000000000, high52Week: 131.5, low52Week: 101.3 },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', sector: 'Healthcare', currentPrice: 548.3, previousClose: 542.4, marketCap: 211000000000, high52Week: 627.9, low52Week: 450.0 },
  { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare', currentPrice: 112.4, previousClose: 111.2, marketCap: 195000000000, high52Week: 124.5, low52Week: 91.4 },
  { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials', currentPrice: 348.4, previousClose: 344.2, marketCap: 178000000000, high52Week: 384.6, low52Week: 212.3 },
  { symbol: 'BA', name: 'Boeing Company', sector: 'Industrials', currentPrice: 218.4, previousClose: 215.3, marketCap: 131000000000, high52Week: 267.5, low52Week: 159.7 },
  { symbol: 'GE', name: 'General Electric Co.', sector: 'Industrials', currentPrice: 168.3, previousClose: 165.8, marketCap: 183000000000, high52Week: 198.1, low52Week: 84.5 },
  { symbol: 'MMM', name: '3M Company', sector: 'Industrials', currentPrice: 98.4, previousClose: 97.2, marketCap: 54000000000, high52Week: 124.8, low52Week: 85.2 },
  { symbol: 'HON', name: 'Honeywell International', sector: 'Industrials', currentPrice: 198.4, previousClose: 196.2, marketCap: 131000000000, high52Week: 220.7, low52Week: 166.4 },
  { symbol: 'NEE', name: 'NextEra Energy Inc.', sector: 'Utilities', currentPrice: 68.4, previousClose: 67.6, marketCap: 139000000000, high52Week: 87.7, low52Week: 44.6 },
  { symbol: 'LIN', name: 'Linde PLC', sector: 'Materials', currentPrice: 448.3, previousClose: 443.2, marketCap: 215000000000, high52Week: 468.0, low52Week: 340.2 },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', sector: 'Consumer Defensive', currentPrice: 728.4, previousClose: 719.3, marketCap: 323000000000, high52Week: 788.9, low52Week: 487.8 },
  { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology', currentPrice: 1248.3, previousClose: 1232.4, marketCap: 519000000000, high52Week: 1438.2, low52Week: 620.0 },
  { symbol: 'SPOT', name: 'Spotify Technology', sector: 'Communication Services', currentPrice: 248.4, previousClose: 244.2, marketCap: 48000000000, high52Week: 298.6, low52Week: 118.4 },
]

async function generatePriceHistory(stockId: string, currentPrice: number) {
  const history = []
  let price = currentPrice * 0.8
  const now = new Date()
  for (let i = 90; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const change = (Math.random() - 0.48) * price * 0.03
    price = Math.max(price + change, 1)
    const open = price
    const high = price * (1 + Math.random() * 0.02)
    const low = price * (1 - Math.random() * 0.02)
    const close = low + Math.random() * (high - low)
    history.push({
      stockId,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: BigInt(Math.floor(Math.random() * 10000000 + 1000000)),
      timestamp: date,
    })
  }
  return history
}

async function main() {
  console.log('🌱 Seeding database...')
  await prisma.transaction.deleteMany()
  await prisma.order.deleteMany()
  await prisma.holding.deleteMany()
  await prisma.watchlist.deleteMany()
  await prisma.portfolio.deleteMany()
  await prisma.priceHistory.deleteMany()
  await prisma.stock.deleteMany()
  await prisma.user.deleteMany()
  console.log('✅ Cleared existing data')

  const createdStocks = []
  for (const stock of stocks) {
    const change = stock.currentPrice - stock.previousClose
    const changePercent = (change / stock.previousClose) * 100
    const created = await prisma.stock.create({
      data: {
        ...stock,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: BigInt(Math.floor(Math.random() * 50000000 + 1000000)),
      },
    })
    createdStocks.push(created)
  }
  console.log(`✅ Created ${createdStocks.length} stocks`)

  for (const stock of createdStocks) {
    const history = await generatePriceHistory(stock.id, stock.currentPrice)
    await prisma.priceHistory.createMany({ data: history })
  }
  console.log('✅ Created price history')

  const hashedPassword = await bcrypt.hash('password123', 12)

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@stockx.com',
      username: 'demotrader',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'Trader',
      cashBalance: 100000,
    },
  })

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@stockx.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      cashBalance: 500000,
    },
  })
  console.log('✅ Created demo users')

  const portfolio = await prisma.portfolio.create({
    data: { userId: demoUser.id, totalValue: 0, totalCost: 0, totalPnL: 0, dayPnL: 0 },
  })

  const selectedStocks = createdStocks.slice(0, 5)
  let totalCost = 0
  for (const stock of selectedStocks) {
    const quantity = Math.floor(Math.random() * 10 + 1)
    const cost = quantity * stock.currentPrice
    totalCost += cost
    await prisma.holding.create({
      data: {
        portfolioId: portfolio.id,
        stockId: stock.id,
        quantity,
        averageBuyPrice: stock.currentPrice,
        totalCost: cost,
        currentValue: cost,
        pnl: 0,
        pnlPercent: 0,
      },
    })
  }

  await prisma.portfolio.update({
    where: { id: portfolio.id },
    data: { totalValue: totalCost, totalCost },
  })

  await prisma.portfolio.create({
    data: { userId: adminUser.id, totalValue: 0, totalCost: 0, totalPnL: 0, dayPnL: 0 },
  })

  const watchlistStocks = createdStocks.slice(5, 10)
  for (const stock of watchlistStocks) {
    await prisma.watchlist.create({
      data: { userId: demoUser.id, stockId: stock.id },
    })
  }

  console.log('✅ Created portfolios, holdings and watchlist')
  console.log('🎉 Seeding complete!')
  console.log('Demo credentials:')
  console.log('  Email: demo@stockx.com')
  console.log('  Password: password123')
}

main()
  .catch(console.error)
  .finally(async () => { await prisma.$disconnect() })