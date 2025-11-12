import { useEffect, useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'


type Asignacion = {
  id_asignacion: number
  docente?: { usuario: { nombre: string } }
  grupo?: { nombre: string }
  materia?: { sigla: string; nombre: string }
}

type ValidacionResult = {
  id_asignacion: number
  total_registros: number
  presentes: number
  ausentes: number
  atrasos: number
  justificados: number
  porcentaje_asistencia: number
  detalles: Array<any>
}

export default function ValidacionAsistencia() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [validacion, setValidacion] = useState<ValidacionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAsignacion, setSelectedAsignacion] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const navigate = useNavigate()
  const [logoutLoading, setLogoutLoading] = useState(false)

  const fetchAsignaciones = async () => {
    try {
      const res = await API.get('/asignaciones')
      setAsignaciones(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (e: any) {
      console.error('Error cargando asignaciones:', e)
    }
  }

  useEffect(() => {
    fetchAsignaciones()
  }, [])

  const handleValidar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAsignacion) {
      setError('Selecciona una asignación')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const payload: any = {
        id_asignacion: parseInt(selectedAsignacion)
      }
      if (fechaInicio) payload.fecha_inicio = fechaInicio
      if (fechaFin) payload.fecha_fin = fechaFin

      const res = await API.post('/validaciones/asistencias', payload)
      setValidacion(res.data)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al validar asistencias')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await API.post('/auth/logout', {})
      localStorage.removeItem('api_token')
      navigate('/login')
    } catch (e: any) {
      console.error('Error al cerrar sesión')
    } finally {
      setLogoutLoading(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PRESENTE': return '#28a745'
      case 'AUSENTE': return '#dc3545'
      case 'ATRASO': return '#ffc107'
      case 'JUSTIFICADO': return '#17a2b8'
      default: return '#6c757d'
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Validar Registros de Asistencia (CU14)</h1>
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {logoutLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </button>
        </div>

        {error && <div style={{ color: '#dc3545', marginBottom: '15px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleValidar} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Seleccionar Asignación para Validar</h3>

          <div style={{ marginBottom: '15px' }}>
            <label>Asignación (Docente-Grupo-Materia) *</label>
            <select
              value={selectedAsignacion}
              onChange={(e) => setSelectedAsignacion(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Selecciona una asignación</option>
              {asignaciones.map(a => (
                <option key={a.id_asignacion} value={a.id_asignacion}>
                  {a.docente?.usuario?.nombre} - {a.grupo?.nombre} - {a.materia?.sigla}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label>Fecha Inicio (opcional)</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label>Fecha Fin (opcional)</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Validando...' : 'Validar Asistencias'}
          </button>
        </form>

        {validacion && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>Resultados de Validación</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #0066cc' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total de Registros</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0066cc' }}>{validacion.total_registros}</div>
              </div>

              <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Presentes</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>{validacion.presentes}</div>
              </div>

              <div style={{ backgroundColor: '#ffebee', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Ausentes</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc3545' }}>{validacion.ausentes}</div>
              </div>

              <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Atrasos</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffc107' }}>{validacion.atrasos}</div>
              </div>

              <div style={{ backgroundColor: '#e0f2f1', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #17a2b8' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Justificados</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#17a2b8' }}>{validacion.justificados}</div>
              </div>

              <div style={{ backgroundColor: '#f3e5f5', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #9c27b0' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>% Asistencia</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9c27b0' }}>{validacion.porcentaje_asistencia}%</div>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4>Detalles de Asistencias</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Fecha</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Hora</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Estado</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Método</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validacion.detalles.map((detalle, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>{detalle.fecha}</td>
                        <td style={{ padding: '12px' }}>{detalle.hora}</td>
                        <td style={{
                          padding: '12px',
                          backgroundColor: getEstadoColor(detalle.estado),
                          color: 'white',
                          borderRadius: '4px',
                          fontWeight: 'bold'
                        }}>
                          {detalle.estado}
                        </td>
                        <td style={{ padding: '12px' }}>{detalle.metodo || '-'}</td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>{detalle.observacion || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
