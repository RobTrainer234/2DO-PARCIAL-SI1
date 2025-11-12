import { useState } from 'react'
import Sidebar from './Sidebar'

type NavProps = {
  onLogout: () => void
  logoutLoading?: boolean
}

export default function Navigation({ onLogout, logoutLoading = false }: NavProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ maxWidth: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
          {/* Botón Hamburguesa */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              marginRight: '20px'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement
              target.style.backgroundColor = '#f0f0f0'
              target.style.borderRadius = '6px'
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement
              target.style.backgroundColor = 'transparent'
            }}
          >
            ☰
          </button>

          {/* Logo (Oculto en móvil) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div style={{ fontSize: '20px' }}>📅</div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111', margin: 0 }}>FICCT</h1>
              <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Sistema de Gestión</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            disabled={logoutLoading}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '500',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: logoutLoading ? 'not-allowed' : 'pointer',
              opacity: logoutLoading ? 0.7 : 1,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement
              if (!logoutLoading) {
                target.style.backgroundColor = '#b91c1c'
              }
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement
              target.style.backgroundColor = '#dc2626'
            }}
          >
            {logoutLoading ? '⏳ Cerrando...' : '← Salir'}
          </button>
        </div>
      </nav>
    </>
  )
}
