import { useState, useEffect } from 'react'
import axios from 'axios'

interface Indicador {
  titulo: string
  valor: number | string
  unidad: string
  color: string
  icono: string
}

export default function DashboardIndicadores() {
  const [indicadores, setIndicadores] = useState<Indicador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarIndicadores()
  }, [])

  const cargarIndicadores = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('api_token')
      const response = await axios.get('http://localhost:8000/api/dashboard/indicadores', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      const datos = response.data?.data || response.data || []
      const listaIndicadores = Array.isArray(datos) ? datos : []

      if (listaIndicadores.length === 0) {
        setIndicadores([
          { titulo: 'Total Docentes', valor: 0, unidad: 'docentes', color: '#3498db', icono: '👨‍🏫' },
          { titulo: 'Materias Activas', valor: 0, unidad: 'materias', color: '#2ecc71', icono: '📚' },
          { titulo: 'Grupos', valor: 0, unidad: 'grupos', color: '#e74c3c', icono: '👥' },
          { titulo: 'Aulas', valor: 0, unidad: 'aulas', color: '#f39c12', icono: '🏛️' }
        ])
      } else {
        const formatted = listaIndicadores.map((item: any) => ({
          titulo: item.titulo || item.title || 'Indicador',
          valor: item.valor || item.value || 0,
          unidad: item.unidad || item.unit || '',
          color: item.color || '#3498db',
          icono: item.icono || item.icon || '📊'
        }))
        setIndicadores(formatted)
      }
    } catch (err) {
      console.error('Error al cargar indicadores:', err)
      setIndicadores([
        { titulo: 'Total Docentes', valor: 0, unidad: 'docentes', color: '#3498db', icono: '👨‍🏫' },
        { titulo: 'Materias Activas', valor: 0, unidad: 'materias', color: '#2ecc71', icono: '📚' },
        { titulo: 'Grupos', valor: 0, unidad: 'grupos', color: '#e74c3c', icono: '👥' },
        { titulo: 'Aulas', valor: 0, unidad: 'aulas', color: '#f39c12', icono: '🏛️' }
      ])
      setError('No se pudieron cargar los indicadores.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>📊 Dashboard de Indicadores</h1>

      {error && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#ffe6e6',
          border: '1px solid #ffcccc',
          borderRadius: '5px',
          color: '#c41e3a'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          <p>Cargando indicadores...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {indicadores.map((indicador, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'white',
                border: `1px solid ${indicador.color}`,
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.transform = 'translateY(-5px)'
                el.style.boxShadow = `0 8px 16px ${indicador.color}33`
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h3 style={{ margin: 0, color: '#333', fontSize: '14px', fontWeight: '600' }}>
                  {indicador.titulo}
                </h3>
                <span style={{ fontSize: '30px' }}>{indicador.icono}</span>
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: indicador.color,
                marginBottom: '10px'
              }}>
                {indicador.valor}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {indicador.unidad}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sección de accesos rápidos */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>🚀 Accesos Rápidos</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {[
            { titulo: 'Gestión de Usuarios', icono: '👤', desc: 'Administrar usuarios' },
            { titulo: 'Docentes', icono: '👨‍🏫', desc: 'Registrar docentes' },
            { titulo: 'Materias', icono: '📚', desc: 'Gestionar materias' },
            { titulo: 'Grupos', icono: '👥', desc: 'Crear grupos' },
            { titulo: 'Aulas', icono: '🏛️', desc: 'Infraestructura' },
            { titulo: 'Horarios', icono: '⏰', desc: 'Carga docente' }
          ].map((acceso, idx) => (
            <div
              key={idx}
              style={{
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.backgroundColor = '#e8f4f8'
                el.style.borderColor = '#3498db'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.backgroundColor = '#f8f9fa'
                el.style.borderColor = '#e0e0e0'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{acceso.icono}</div>
              <div style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
                {acceso.titulo}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                {acceso.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón para recargar */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={cargarIndicadores}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
        >
          🔄 Recargar Indicadores
        </button>
      </div>
    </div>
  )
}
