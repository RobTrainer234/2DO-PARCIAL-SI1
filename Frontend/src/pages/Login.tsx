import { useState } from 'react'
import { login } from '../services/api'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!correo.trim() || !password.trim()) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await login(correo, password)
      const token = res.data.token
      localStorage.setItem('api_token', token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Error completo:', err)
      console.error('Error response:', err.response)
      const errorMsg = err.response?.data?.message || err.message || 'Credenciales incorrectas. Intenta nuevamente.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Card */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '40px 30px', background: '#fff' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>📅</div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111', margin: '0 0 8px' }}>FICCT</h1>
            <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Sistema de Gestión Académica</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            {/* Correo */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Correo Institucional
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value)
                  setError(null)
                }}
                placeholder="admin@ficct.test"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  background: '#fff',
                  color: '#111',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'text'
                }}
              />
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                placeholder="••••••••"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  background: '#fff',
                  color: '#111',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'text'
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '14px',
                fontWeight: '500',
                background: loading ? '#9ca3af' : '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.target as HTMLButtonElement).style.background = '#1d4ed8'
              }}
              onMouseLeave={(e) => {
                if (!loading) (e.target as HTMLButtonElement).style.background = '#2563eb'
              }}
            >
              {loading ? '⏳ Iniciando sesión...' : '→ Iniciar Sesión'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px' }}>Credenciales de demostración:</p>
            <code style={{
              display: 'block',
              fontSize: '12px',
              background: '#f3f4f6',
              padding: '8px',
              borderRadius: '4px',
              margin: '6px 0',
              fontFamily: 'monospace',
              color: '#1f2937'
            }}>
              Email: admin@ficct.test
            </code>
            <code style={{
              display: 'block',
              fontSize: '12px',
              background: '#f3f4f6',
              padding: '8px',
              borderRadius: '4px',
              margin: '6px 0',
              fontFamily: 'monospace',
              color: '#1f2937'
            }}>
              Contraseña: Secret123!
            </code>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#999', marginTop: '20px', margin: '20px 0 0' }}>
          FICCT © 2025
        </p>
      </div>
    </div>
  )
}
