import { useEffect, useState } from 'react'
import API from '../services/api'

type CargaDocente = {
  id_carga: number
  sigla_materia: string
  nombre_materia?: string
  horas_asignadas: number
  orden_preferencia: number
  horarios?: Array<{
    id_horario: number
    dia_semana: string
    hora_inicio: string
    hora_fin: string
    aula?: string
  }>
}

type DocenteInfo = {
  cod_docente: number
  nombre: string
  especialidad?: string
}

export default function MiCargaHoraria() {
  const [docente, setDocente] = useState<DocenteInfo | null>(null)
  const [cargas, setCargas] = useState<CargaDocente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalHoras, setTotalHoras] = useState(0)

  useEffect(() => {
    fetchMiCargaHoraria()
  }, [])

  const fetchMiCargaHoraria = async () => {
    setLoading(true)
    setError(null)
    try {
      // Obtener el usuario actual (docente logueado)
      const meRes = await API.get('/auth/me')
      const usuarioActual = meRes.data

      // Buscar el docente correspondiente
      const docentesRes = await API.get('/docentes')
      const docentes = Array.isArray(docentesRes.data) ? docentesRes.data : docentesRes.data.data || []
      
      const docenteActual = docentes.find((d: any) => d.usuario_id === usuarioActual.id)
      
      if (!docenteActual) {
        setError('No eres un docente registrado en el sistema')
        return
      }

      setDocente({
        cod_docente: docenteActual.cod_docente,
        nombre: `${usuarioActual.nombre} ${usuarioActual.apellido}`,
        especialidad: docenteActual.especialidad
      })

      // Obtener carga horaria del docente
      const cargaRes = await API.get(`/carga-horaria/docente/${docenteActual.cod_docente}`)
      setCargas(cargaRes.data.cargas || [])
      setTotalHoras(cargaRes.data.total_horas || 0)
    } catch (e: any) {
      console.error('Error:', e)
      setError('Error al cargar tu carga horaria')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Cargando tu información...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Mi Carga Horaria</h1>

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            <strong>Advertencia:</strong> {error}
          </div>
        )}

        {!error && docente && (
          <>
            {/* Información del Docente */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3>Información Personal</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <p><strong>Nombre:</strong></p>
                  <p style={{ fontSize: '18px', color: '#007bff' }}>{docente.nombre}</p>
                </div>
                <div>
                  <p><strong>Especialidad:</strong></p>
                  <p style={{ fontSize: '18px' }}>{docente.especialidad || 'No especificada'}</p>
                </div>
              </div>
            </div>

            {/* Resumen de Carga */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3>Resumen de Carga Horaria</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div style={{
                  backgroundColor: '#e7f3ff',
                  padding: '15px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  borderLeft: '4px solid #007bff'
                }}>
                  <p style={{ color: '#666', marginBottom: '5px' }}>Total de Horas</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>{totalHoras}</p>
                </div>
                <div style={{
                  backgroundColor: '#d4edda',
                  padding: '15px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  borderLeft: '4px solid #28a745'
                }}>
                  <p style={{ color: '#666', marginBottom: '5px' }}>Materias Asignadas</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>{cargas.length}</p>
                </div>
                <div style={{
                  backgroundColor: '#fff3cd',
                  padding: '15px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  borderLeft: '4px solid #ffc107'
                }}>
                  <p style={{ color: '#666', marginBottom: '5px' }}>Promedio por Materia</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffc107' }}>
                    {cargas.length > 0 ? Math.round(totalHoras / cargas.length) : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Materias Detalladas */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3>Materias Asignadas</h3>

              {cargas.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                  Aún no tienes materias asignadas
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Materia</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Horas/Mes</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Orden</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Horarios</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cargas.map((carga) => (
                        <tr key={carga.id_carga} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '12px' }}>
                            <strong style={{ fontSize: '16px', color: '#0066cc' }}>{carga.sigla_materia}</strong>
                            <br />
                            <small style={{ color: '#666' }}>{carga.nombre_materia}</small>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                            {carga.horas_asignadas} hrs
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {carga.orden_preferencia}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {carga.horarios && carga.horarios.length > 0 ? (
                              <div>
                                {carga.horarios.map((horario, idx) => (
                                  <div key={idx} style={{ 
                                    backgroundColor: '#f0f0f0', 
                                    padding: '8px', 
                                    marginBottom: '5px', 
                                    borderRadius: '3px',
                                    fontSize: '13px'
                                  }}>
                                    <strong>{horario.dia_semana}</strong>
                                    <br />
                                    {horario.hora_inicio} - {horario.hora_fin}
                                    {horario.aula && (
                                      <><br /><small>🏫 {horario.aula}</small></>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <small style={{ color: '#999' }}>Sin horarios definidos</small>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Leyenda */}
            <div style={{
              backgroundColor: '#e7f3ff',
              padding: '15px',
              borderRadius: '4px',
              marginTop: '20px',
              border: '1px solid #b3d9ff'
            }}>
              <p style={{ color: '#004085', marginBottom: '10px', fontSize: '13px' }}>
                <strong>ℹ️ Nota:</strong> Esta es tu carga horaria tal como la asignó el administrador. 
                Si notas discrepancias, por favor contacta con la administración académica.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
