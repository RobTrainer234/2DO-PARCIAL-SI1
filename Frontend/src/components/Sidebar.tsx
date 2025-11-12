import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { mainMenuConfig, filterMenuByRoles } from '../config/menuConfig'
import type { MenuItem } from '../config/menuConfig'

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
  userRoles?: string[]
}

export default function Sidebar({ isOpen, onClose, userRoles = ['docente'] }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const location = useLocation()

  // Filtrar menú según roles del usuario
  const filteredMenu = useMemo(() => {
    return filterMenuByRoles(userRoles, mainMenuConfig)
  }, [userRoles])

  // Auto-expandir menú si la ruta actual está dentro
  useEffect(() => {
    const expanded = new Set<string>()
    const findAndExpand = (items: MenuItem[]) => {
      items.forEach(item => {
        if (item.children) {
          const hasActiveChild = item.children.some(child =>
            location.pathname.startsWith(child.path || '/not-found')
          )
          if (hasActiveChild) {
            expanded.add(item.label)
          }
          findAndExpand(item.children)
        }
      })
    }
    findAndExpand(filteredMenu)
    setExpandedItems(expanded)
  }, [location.pathname, filteredMenu])

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
        onClick={onClose}
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
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '280px',
          backgroundColor: '#2d3436',
          color: '#fff',
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          boxShadow: isOpen ? '2px 0 10px rgba(0, 0, 0, 0.3)' : 'none',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Menú */}
        <nav style={{ padding: '15px 0', overflowY: 'auto', flex: 1 }}>
          {filteredMenu.map(item => renderMenuItem(item, 0))}
        </nav>
      </div>
    </>
  )
}
