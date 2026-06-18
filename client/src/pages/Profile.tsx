
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Mail, AtSign, DollarSign, LogOut } from 'lucide-react'

const Profile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
            <p className="text-gray-400">@{user?.username}</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: User, label: 'Full Name', value: `${user?.firstName} ${user?.lastName}` },
            { icon: Mail, label: 'Email', value: user?.email },
            { icon: AtSign, label: 'Username', value: `@${user?.username}` },
            { icon: DollarSign, label: 'Cash Balance', value: `$${user?.cashBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                <div className="bg-purple-600/20 p-2 rounded-lg">
                  <Icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">{item.label}</p>
                  <p className="text-white font-medium">{item.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-6 py-3 rounded-lg transition-colors border border-red-600/30"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  )
}

export default Profile