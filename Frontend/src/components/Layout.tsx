import type { ReactNode } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link, useLocation } from 'react-router-dom'
import { mainMenuConfig, filterMenuByRoles } from '../config/menuConfig'
import type { MenuItem } from '../config/menuConfig'

interface LayoutProps {
  children: ReactNode
  userRoles?: string[]
}

export default function Layout({ children, userRoles = ['admin'] }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const handleLogout = () => {
    localStorage.removeItem('api_token')
    navigate('/login')
  }

  const filteredMenu = filterMenuByRoles(userRoles, mainMenuConfig)

  const toggleExpand = (label: string, e: React.MouseEvent) => {
    e.preventDefault()
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(label)) {
      newExpanded.delete(label)
    } else {
      newExpanded.add(label)
    }
    setExpandedItems(newExpanded)
  }

  const isActive = (path?: string) => {
    return path && location.pathname === path
  }

  const renderMenuItem = (item: MenuItem, level = 0): React.ReactNode => {
    const isExpandable = !!item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.label)
    const active = isActive(item.path)

    if (isExpandable) {
      return (
        <div key={item.label} style={{ marginLeft: `${level * 12}px` }}>
          <button
            onClick={(e) => toggleExpand(item.label, e)}
            style={{
              width: '100%',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              borderLeft: '3px solid transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#404854'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
            <span style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              fontSize: '12px'
            }}>▼</span>
          </button>
          {isExpanded && (
            <div>
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.label}
        to={item.path || '#'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          color: active ? '#00d4ff' : '#fff',
          textDecoration: 'none',
          borderLeft: active ? '3px solid #00d4ff' : '3px solid transparent',
          backgroundColor: active ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
          transition: 'all 0.2s',
          marginLeft: `${level * 12}px`,
          cursor: 'pointer',
          fontSize: '14px'
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = '#404854'
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        <span style={{ fontSize: '16px' }}>{item.icon}</span>
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar - Sin position fixed */}
      {sidebarOpen && (
        <div style={{
          width: '280px',
          backgroundColor: '#2d3436',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
        }}>
          <nav style={{ padding: '15px 0', overflowY: 'auto', flex: 1 }}>
            {filteredMenu.map(item => renderMenuItem(item, 0))}
          </nav>
        </div>
      )}

      {/* Main Content - SIN BARRAS EXTRAS */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header ÚNICO - hamburguesa + titulo + salir */}
        <div style={{
          backgroundColor: 'white',
          padding: '10px 20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '22px',
              cursor: 'pointer',
              padding: '4px 8px',
              color: '#333',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0066cc'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
            title="Abrir/Cerrar menú"
          >
            ☰
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{ margin: '0', fontSize: '16px', color: '#0066cc', fontWeight: '700', letterSpacing: '0.5px' }}>
              FICCT
            </h1>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
            title="Cerrar sesión"
          >
            🚪 Salir
          </button>
        </div>

        {/* Content - SIN PADDING EXTRA */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
