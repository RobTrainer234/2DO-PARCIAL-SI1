import { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'


type Horario = {
  id_horario: number
  dia: string
  hora_inicio: string
  hora_final: string
  infraestructura?: { nro: string; tipo?: { nombre: string } }
}

type ConsultaResult = {
  asignacion: any
  horarios: Horario[]
}

export default function ConsultaHorario() {
  const [consultaResult, setConsultaResult] = useState<ConsultaResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tipoConsulta, setTipoConsulta] = useState<'asignacion' | 'docente' | 'grupo'>('asignacion')
  const [parametro, setParametro] = useState('')
  const navigate = useNavigate()
  const [logoutLoading, setLogoutLoading] = useState(false)

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parametro) {
      setError('Ingresa el ID o número de identificación')
      return
    }

    setLoading(true)
    setError(null)
    try {
      let endpoint = ''
      if (tipoConsulta === 'asignacion') {
        endpoint = `/consultas/horario/asignacion/${parametro}`
      } else if (tipoConsulta === 'docente') {
        endpoint = `/consultas/horario/docente/${parametro}`
      } else if (tipoConsulta === 'grupo') {
        endpoint = `/consultas/horario/grupo/${parametro}`
      }

      const res = await API.get(endpoint)
      setConsultaResult(res.data)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al consultar horarios')
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

  const calcularHoras = (inicio: string, fin: string) => {
    const [hI, mI, sI] = inicio.split(':').map(Number)
    const [hF, mF, sF] = fin.split(':').map(Number)
    const minutos = (hF * 60 + mF + sF / 60) - (hI * 60 + mI + sI / 60)
    return (minutos / 60).toFixed(2)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Consultar Horarios (CU15)</h1>
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

        <form onSubmit={handleConsultar} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Consultar Horario</h3>

          <div style={{ marginBottom: '15px' }}>
            <label>Tipo de Consulta *</label>
            <select
              value={tipoConsulta}
              onChange={(e) => {
                setTipoConsulta(e.target.value as any)
                setParametro('')
              }}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="asignacion">Por Asignación (ID)</option>
              <option value="docente">Por Docente (Cod. Docente)</option>
              <option value="grupo">Por Grupo (ID Grupo)</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>
              {tipoConsulta === 'asignacion' && 'ID de Asignación *'}
              {tipoConsulta === 'docente' && 'Código de Docente *'}
              {tipoConsulta === 'grupo' && 'ID de Grupo *'}
            </label>
            <input
              type="number"
              value={parametro}
              onChange={(e) => setParametro(e.target.value)}
              placeholder={
                tipoConsulta === 'asignacion' ? 'Ej: 1' :
                  tipoConsulta === 'docente' ? 'Ej: 1' :
                    'Ej: 1'
              }
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
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
            {loading ? 'Consultando...' : 'Consultar'}
          </button>
        </form>

        {consultaResult && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {tipoConsulta === 'asignacion' && consultaResult.asignacion && (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
                <h4 style={{ margin: 0 }}>Asignación</h4>
                <p><strong>Docente:</strong> {consultaResult.asignacion.docente?.usuario?.nombre}</p>
                <p><strong>Grupo:</strong> {consultaResult.asignacion.grupo?.nombre}</p>
                <p><strong>Materia:</strong> {consultaResult.asignacion.materia?.sigla} - {consultaResult.asignacion.materia?.nombre}</p>
                <p><strong>Gestión:</strong> {consultaResult.asignacion.gestion?.anio} - {consultaResult.asignacion.gestion?.periodo}</p>
              </div>
            )}

            <h3>Horarios</h3>
            {consultaResult.horarios && consultaResult.horarios.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Día</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Hora Inicio</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Hora Final</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Duración (horas)</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Aula</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultaResult.horarios.map((horario) => (
                      <tr key={horario.id_horario} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{horario.dia}</td>
                        <td style={{ padding: '12px' }}>{horario.hora_inicio}</td>
                        <td style={{ padding: '12px' }}>{horario.hora_final}</td>
                        <td style={{ padding: '12px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
                          {calcularHoras(horario.hora_inicio, horario.hora_final)}
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#0066cc' }}>
                          {horario.infraestructura?.nro || 'Sin asignar'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {horario.infraestructura?.tipo?.nombre || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#666' }}>No hay horarios registrados para esta consulta.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
