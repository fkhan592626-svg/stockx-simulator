
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import {
  TrendingUp,
  LayoutDashboard,
  
  ClipboardList,
  ArrowLeftRight,
  Star,
  User,
  LogOut,
  BarChart2,
} from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { connected } = useSocket()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    
    { path: '/orders', label: 'Orders', icon: ClipboardList },
    { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { path: '/watchlist', label: 'Watchlist', icon: Star },
    { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  ]

  return (
    <nav className="bg-[#1a1a2e] border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <TrendingUp className="text-green-400 w-7 h-7" />
          <span className="text-xl font-bold text-white">StockX</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:block">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-gray-400 text-xs hidden md:block">
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>

          <div className="text-right hidden md:block">
            <p className="text-white text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-green-400 text-xs">${user?.cashBalance?.toLocaleString()}</p>
          </div>

          <Link
            to="/profile"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <User className="w-5 h-5" />
          </Link>

          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar