import { LogOut, Loader } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API, { logout } from '../services/api'

interface HeaderProps {
  title?: string
  description?: string
}

export default function Header({ title, description }: HeaderProps) {
  const [logoutLoading, setLogoutLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await logout()
    } catch (e) {
      console.error('logout', e)
    } finally {
      localStorage.removeItem('api_token')
      localStorage.removeItem('user')
      delete API.defaults.headers.common['Authorization']
      navigate('/login')
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <span className="text-lg">📅</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">FICCT</h1>
            <p className="text-xs text-gray-500">Sistema de Gestión</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {title && (
            <div className="hidden md:block border-l border-gray-200 pl-4">
              <p className="text-sm text-gray-700 font-medium">{title}</p>
              {description && <p className="text-xs text-gray-500">{description}</p>}
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {logoutLoading ? (
              <>
                <Loader className="w-3.5 h-3.5 animate-spin" />
                Cerrando...
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                Salir
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
