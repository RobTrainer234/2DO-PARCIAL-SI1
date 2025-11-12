import { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'


type ReporteCargaHoraria = {
  total_horas_carga: number
  carga_por_docente?: Array<{ docente: string; total_horas: number }>
  carga_por_aula?: Array<{ aula: string; total_horas: number; usos: number }>
  carga_por_asignacion?: Array<{
    grupo: string
    materia: string
    gestion: string
    horas_totales: number
    horarios: Array<any>
  }>
}

export default function ReporteCargaHoraria() {
  const [reporte, setReporte] = useState<ReporteCargaHoraria | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tipoReporte, setTipoReporte] = useState<'docente' | 'grupo' | 'gestion'>('docente')
  const [formData, setFormData] = useState({
    cod_docente: '',
    id_grupo: '',
    id_gestion: ''
  })
  const navigate = useNavigate()
  const [logoutLoading, setLogoutLoading] = useState(false)

  const handleGenerarReporte = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let endpoint = ''

      if (tipoReporte === 'docente') {
        if (!formData.cod_docente) {
          setError('Ingresa código de docente')
          setLoading(false)
          return
        }
        endpoint = `/reportes/carga-horaria/docente/${formData.cod_docente}`
      } else if (tipoReporte === 'grupo') {
        if (!formData.id_grupo) {
          setError('Ingresa ID de grupo')
          setLoading(false)
          return
        }
        endpoint = `/reportes/carga-horaria/grupo/${formData.id_grupo}`
      } else if (tipoReporte === 'gestion') {
        if (!formData.id_gestion) {
          setError('Ingresa ID de gestión')
          setLoading(false)
          return
        }
        endpoint = `/reportes/carga-horaria/gestion/${formData.id_gestion}`
      }

      const res = await API.get(endpoint)
      setReporte(res.data)
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Generar Reporte de Carga Horaria (CU17)</h1>
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
              <option value="docente">Por Docente</option>
              <option value="grupo">Por Grupo</option>
              <option value="gestion">Por Gestión</option>
            </select>
          </div>

          {tipoReporte === 'docente' && (
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
          )}

          {tipoReporte === 'grupo' && (
            <div style={{ marginBottom: '15px' }}>
              <label>ID Grupo *</label>
              <input
                type="number"
                value={formData.id_grupo}
                onChange={(e) => setFormData({ ...formData, id_grupo: e.target.value })}
                placeholder="Ej: 1"
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
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

            <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Total de Horas de Carga</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#28a745' }}>
                {reporte.total_horas_carga} horas
              </div>
            </div>

            {reporte.carga_por_docente && reporte.carga_por_docente.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Carga Horaria por Docente</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Docente</th>
                        <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Total Horas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.carga_por_docente.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '12px' }}>{item.docente}</td>
                          <td style={{ padding: '12px', textAlign: 'right', backgroundColor: '#e7f3ff', fontWeight: 'bold' }}>
                            {item.total_horas} h
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reporte.carga_por_aula && reporte.carga_por_aula.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Carga Horaria por Aula</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Aula</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Total Horas</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Usos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.carga_por_aula.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '12px', fontFamily: 'monospace', color: '#0066cc' }}>{item.aula}</td>
                          <td style={{ padding: '12px', textAlign: 'center', backgroundColor: '#e7f3ff', fontWeight: 'bold' }}>
                            {item.total_horas} h
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{item.usos}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reporte.carga_por_asignacion && reporte.carga_por_asignacion.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Detalles por Asignación</h4>
                {reporte.carga_por_asignacion.map((asignacion, idx) => (
                  <div key={idx} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <h5 style={{ margin: '0 0 10px 0' }}>
                      {asignacion.grupo} - {asignacion.materia} ({asignacion.gestion})
                    </h5>
                    <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                      <strong>Total de Horas:</strong> <span style={{ fontSize: '18px', color: '#28a745', fontWeight: 'bold' }}>{asignacion.horas_totales}h</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead style={{ backgroundColor: '#e8f5e9' }}>
                        <tr>
                          <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Día</th>
                          <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Inicio</th>
                          <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Fin</th>
                          <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Horas</th>
                          <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Aula</th>
                        </tr>
                      </thead>
                      <tbody>
                        {asignacion.horarios.map((horario, hidx) => (
                          <tr key={hidx} style={{ borderBottom: '1px solid #dee2e6' }}>
                            <td style={{ padding: '8px' }}>{horario.dia}</td>
                            <td style={{ padding: '8px' }}>{horario.hora_inicio}</td>
                            <td style={{ padding: '8px' }}>{horario.hora_final}</td>
                            <td style={{ padding: '8px', textAlign: 'center', backgroundColor: '#e7f3ff', fontWeight: 'bold' }}>
                              {horario.horas}
                            </td>
                            <td style={{ padding: '8px', fontFamily: 'monospace', color: '#0066cc' }}>{horario.aula}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
