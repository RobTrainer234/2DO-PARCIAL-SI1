import { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'


type ReporteAsistencia = {
  docente?: string
  grupo?: string
  materia?: string
  gestion?: string
  periodo?: string
  fecha_inicio?: string
  fecha_fin?: string
  estadisticas?: {
    total_registros: number
    presentes: number
    ausentes: number
    atrasos: number
    justificados: number
    porcentaje_asistencia: number
  }
  detalles?: Array<any>
  resumen_general?: any
  detalles_por_asignacion?: Array<any>
}

export default function ReporteAsistencia() {
  const [reporte, setReporte] = useState<ReporteAsistencia | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tipoReporte, setTipoReporte] = useState<'asignacion' | 'docente' | 'gestion'>('asignacion')
  const [formData, setFormData] = useState({
    id_asignacion: '',
    cod_docente: '',
    id_gestion: '',
    fecha_inicio: '',
    fecha_fin: ''
  })
  const navigate = useNavigate()
  const [logoutLoading, setLogoutLoading] = useState(false)

  const handleGenerarReporte = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let endpoint = ''
      let payload: any = {}

      if (tipoReporte === 'asignacion') {
        if (!formData.id_asignacion) {
          setError('Ingresa ID de asignación')
          setLoading(false)
          return
        }
        endpoint = '/reportes/asistencia/asignacion'
        payload = {
          id_asignacion: parseInt(formData.id_asignacion)
        }
        if (formData.fecha_inicio) payload.fecha_inicio = formData.fecha_inicio
        if (formData.fecha_fin) payload.fecha_fin = formData.fecha_fin
        const res = await API.post(endpoint, payload)
        setReporte(res.data)
      } else if (tipoReporte === 'docente') {
        if (!formData.cod_docente || !formData.fecha_inicio || !formData.fecha_fin) {
          setError('Todos los campos son requeridos')
          setLoading(false)
          return
        }
        endpoint = '/reportes/asistencia/docente'
        payload = {
          cod_docente: parseInt(formData.cod_docente),
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin
        }
        const res = await API.post(endpoint, payload)
        setReporte(res.data)
      } else if (tipoReporte === 'gestion') {
        if (!formData.id_gestion) {
          setError('Selecciona una gestión')
          setLoading(false)
          return
        }
        endpoint = `/reportes/asistencia/gestion/${formData.id_gestion}`
        const res = await API.get(endpoint)
        setReporte(res.data)
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al generar reporte')
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
          <h1>Generar Reporte de Asistencia (CU16)</h1>
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

        <form onSubmit={handleGenerarReporte} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Seleccionar Tipo de Reporte</h3>

          <div style={{ marginBottom: '15px' }}>
            <label>Tipo de Reporte *</label>
            <select
              value={tipoReporte}
              onChange={(e) => {
                setTipoReporte(e.target.value as any)
                setReporte(null)
              }}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="asignacion">Por Asignación</option>
              <option value="docente">Por Docente</option>
              <option value="gestion">Por Gestión</option>
            </select>
          </div>

          {tipoReporte === 'asignacion' && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label>ID Asignación *</label>
                <input
                  type="number"
                  value={formData.id_asignacion}
                  onChange={(e) => setFormData({ ...formData, id_asignacion: e.target.value })}
                  placeholder="Ej: 1"
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label>Fecha Inicio (opcional)</label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label>Fecha Fin (opcional)</label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>
            </>
          )}

          {tipoReporte === 'docente' && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label>Código de Docente *</label>
                <input
                  type="number"
                  value={formData.cod_docente}
                  onChange={(e) => setFormData({ ...formData, cod_docente: e.target.value })}
                  placeholder="Ej: 1"
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label>Fecha Inicio *</label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label>Fecha Fin *</label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>
            </>
          )}

          {tipoReporte === 'gestion' && (
            <div style={{ marginBottom: '15px' }}>
              <label>ID Gestión *</label>
              <input
                type="number"
                value={formData.id_gestion}
                onChange={(e) => setFormData({ ...formData, id_gestion: e.target.value })}
                placeholder="Ej: 1"
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
        </form>

        {reporte && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>Resultado del Reporte</h3>

            {reporte.docente && (
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
                <p><strong>Docente:</strong> {reporte.docente}</p>
                {reporte.grupo && <p><strong>Grupo:</strong> {reporte.grupo}</p>}
                {reporte.materia && <p><strong>Materia:</strong> {reporte.materia}</p>}
                {reporte.gestion && <p><strong>Gestión:</strong> {reporte.gestion}</p>}
                {reporte.periodo && <p><strong>Período:</strong> {reporte.periodo}</p>}
              </div>
            )}

            {reporte.estadisticas && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #0066cc' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066cc' }}>{reporte.estadisticas.total_registros}</div>
                </div>
                <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Presentes</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{reporte.estadisticas.presentes}</div>
                </div>
                <div style={{ backgroundColor: '#f3e5f5', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #9c27b0' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>% Asistencia</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9c27b0' }}>{reporte.estadisticas.porcentaje_asistencia}%</div>
                </div>
              </div>
            )}

            {reporte.resumen_general && (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h4>Resumen General</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <p><strong>Total:</strong> {reporte.resumen_general.total_registros}</p>
                  <p><strong>Presentes:</strong> {reporte.resumen_general.presentes}</p>
                  <p><strong>Ausentes:</strong> {reporte.resumen_general.ausentes}</p>
                  <p><strong>% Asistencia:</strong> {reporte.resumen_general.porcentaje_asistencia}%</p>
                </div>
              </div>
            )}

            {reporte.detalles_por_asignacion && reporte.detalles_por_asignacion.length > 0 && (
              <div>
                <h4>Detalles por Asignación</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Grupo</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Materia</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Total</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Presentes</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>% Asist.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.detalles_por_asignacion.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '12px' }}>{item.grupo}</td>
                          <td style={{ padding: '12px', fontFamily: 'monospace', color: '#0066cc' }}>{item.materia}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{item.total_registros}</td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#28a745', fontWeight: 'bold' }}>{item.presentes}</td>
                          <td style={{ padding: '12px', textAlign: 'center', backgroundColor: '#e7f3ff', borderRadius: '4px', fontWeight: 'bold' }}>
                            {item.porcentaje_asistencia}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reporte.detalles && reporte.detalles.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4>Detalles Completos</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Fecha</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Hora</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Estado</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Método</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.detalles.map((detalle, idx) => (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
